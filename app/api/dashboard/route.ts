import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expense, income, asset, business } from "@/db/index";
import { eq, sql, and, gte, lte, sum } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const userBusiness = await db
      .select()
      .from(business)
      .where(eq(business.userId, session.user.id))
      .limit(1);

    if (userBusiness.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const businessId = userBusiness[0].id;
    const { searchParams } = new URL(request.url);

    // Get date range from query params, default to last 6 months
    const monthsBack = parseInt(searchParams.get('months') || '6');
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(endDate, monthsBack - 1));

    // Calculate totals
    const [
      totalExpenses,
      totalIncome,
      totalAssets,
      recentTransactions,
      monthlyData,
      categoryData
    ] = await Promise.all([
      // Total expenses
      db
        .select({ total: sum(expense.amount) })
        .from(expense)
        .where(
          and(
            eq(expense.businessId, businessId),
            gte(expense.date, startDate),
            lte(expense.date, endDate)
          )
        ),
      // Total income
      db
        .select({ total: sum(income.amount) })
        .from(income)
        .where(
          and(
            eq(income.businessId, businessId),
            gte(income.date, startDate),
            lte(income.date, endDate)
          )
        ),
      // Total assets
      db
        .select({ total: sum(asset.currentValue) })
        .from(asset)
        .where(eq(asset.businessId, businessId)),
      // Recent transactions (last 10)
      db
        .select()
        .from(expense)
        .where(eq(expense.businessId, businessId))
        .orderBy(expense.createdAt)
        .limit(10),
      // Monthly data for charts
      db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${expense.date})`,
          expenses: sum(expense.amount),
        })
        .from(expense)
        .where(
          and(
            eq(expense.businessId, businessId),
            gte(expense.date, startDate),
            lte(expense.date, endDate)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${expense.date})`)
        .orderBy(sql`DATE_TRUNC('month', ${expense.date})`),
      // Category breakdown
      db
        .select({
          category: expense.category,
          amount: sum(expense.amount),
          count: sql<number>`count(*)`,
        })
        .from(expense)
        .where(
          and(
            eq(expense.businessId, businessId),
            gte(expense.date, startDate),
            lte(expense.date, endDate)
          )
        )
        .groupBy(expense.category)
        .orderBy(sql`sum(${expense.amount})`)
        .limit(10)
    ]);

    // Process monthly data to include income
    const monthlyExpenses = monthlyData as Array<{
      month: string;
      expenses: string;
    }>;

    // Get income by month
    const monthlyIncomeResults = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${income.date})`,
        income: sum(income.amount),
      })
      .from(income)
      .where(
        and(
          eq(income.businessId, businessId),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${income.date})`)
      .orderBy(sql`DATE_TRUNC('month', ${income.date})`);

    // Merge expense and income data
    const monthlyDataMerged = monthlyExpenses.map(expense => {
      const incomeData = monthlyIncomeResults.find(
        (income: any) => income.month === expense.month
      );
      return {
        month: expense.month,
        expenses: parseFloat(expense.expenses as string) || 0,
        income: parseFloat(incomeData?.income as string || "0"),
        netCashFlow: parseFloat(expense.expenses as string || "0") + parseFloat(incomeData?.income as string || "0"),
      };
    });

    // Process category data
    const categoryDataProcessed = (categoryData as Array<{
      category: string;
      amount: string;
      count: number;
    }>).map(cat => ({
      category: cat.category,
      amount: parseFloat(cat.amount) || 0,
      count: cat.count,
      percentage: 0, // Will be calculated
    }));

    // Calculate percentages
    const totalExpensesAmount = categoryDataProcessed.reduce((sum, cat) => sum + cat.amount, 0);
    categoryDataProcessed.forEach(cat => {
      cat.percentage = totalExpensesAmount > 0 ? (cat.amount / totalExpensesAmount) * 100 : 0;
    });

    // Get recent income and assets
    const [recentIncome, recentAssets] = await Promise.all([
      db
        .select()
        .from(income)
        .where(eq(income.businessId, businessId))
        .orderBy(income.createdAt)
        .limit(5),
      db
        .select()
        .from(asset)
        .where(eq(asset.businessId, businessId))
        .orderBy(asset.createdAt)
        .limit(5),
    ]);

    // Combine all recent transactions
    const allRecentTransactions = [
      ...recentTransactions.map(t => ({
        ...t,
        type: 'expense' as const,
        amount: t.amount.toString(),
        date: t.date.toISOString().split('T')[0],
        vendor: t.vendor || undefined,
        description: t.description,
        category: t.category,
        createdAt: t.createdAt.toISOString()
      })),
      ...recentIncome.map(t => ({
        ...t,
        type: 'income' as const,
        amount: t.amount.toString(),
        date: t.date.toISOString().split('T')[0],
        client: t.client || undefined,
        description: t.description,
        category: t.category,
        createdAt: t.createdAt.toISOString()
      })),
      ...recentAssets.map(t => ({
        ...t,
        type: 'asset' as const,
        amount: t.currentValue.toString(),
        date: t.purchaseDate.toISOString().split('T')[0],
        description: t.description || t.name,
        category: 'Asset',
        createdAt: t.createdAt.toISOString(),
        purchaseDate: t.purchaseDate.toISOString().split('T')[0]
      })),
    ].sort((a, b) => {
      const aDate = a.createdAt || a.date || ('purchaseDate' in a ? a.purchaseDate : '') || '';
      const bDate = b.createdAt || b.date || ('purchaseDate' in b ? b.purchaseDate : '') || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }).slice(0, 10);

    const response = {
      summary: {
        totalExpenses: parseFloat(totalExpenses[0]?.total as string || "0"),
        totalIncome: parseFloat(totalIncome[0]?.total as string || "0"),
        totalAssets: parseFloat(totalAssets[0]?.total as string || "0"),
        netWorth: parseFloat(totalAssets[0]?.total as string || "0") + parseFloat(totalIncome[0]?.total as string || "0") - parseFloat(totalExpenses[0]?.total as string || "0"),
      },
      monthlyData: monthlyDataMerged,
      categoryBreakdown: categoryDataProcessed,
      recentTransactions: allRecentTransactions,
      businessName: userBusiness[0].name,
      currency: userBusiness[0].currency,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months: monthsBack,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}