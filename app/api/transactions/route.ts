import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expense, income, asset } from "@/db/schema/finance";
import { business } from "@/db/schema/business";
import { eq } from "drizzle-orm";
import { parseTransactionWithAI, TransactionData } from "@/lib/openai";

export async function POST(request: NextRequest) {
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

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
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
        { error: "Business not found. Please set up your business first." },
        { status: 404 }
      );
    }

    // Parse transaction with AI
    const parsedData = await parseTransactionWithAI(message, userBusiness[0].id);

    // Save parsed transactions to database
    const savedTransactions = [];
    for (const transaction of parsedData.transactions) {
      try {
        let savedTransaction;

        if (transaction.type === "expense") {
          const [newExpense] = await db.insert(expense).values({
            businessId: userBusiness[0].id,
            amount: transaction.amount.toString(),
            date: new Date(transaction.date),
            category: transaction.category,
            description: transaction.description,
            vendor: transaction.vendor || "Unknown",
            paymentMethod: transaction.paymentMethod || "unspecified",
            notes: transaction.notes,
            isRecurring: transaction.isRecurring || "once",
            taxDeductible: transaction.taxDeductible || "yes",
          }).returning();
          savedTransaction = newExpense;
        } else if (transaction.type === "income") {
          const [newIncome] = await db.insert(income).values({
            businessId: userBusiness[0].id,
            amount: transaction.amount.toString(),
            date: new Date(transaction.date),
            category: transaction.category,
            description: transaction.description,
            client: transaction.client || "Unknown",
            paymentMethod: transaction.paymentMethod || "unspecified",
            notes: transaction.notes,
            isRecurring: transaction.isRecurring || "once",
            taxWithheld: "0",
          }).returning();
          savedTransaction = newIncome;
        } else if (transaction.type === "asset") {
          const [newAsset] = await db.insert(asset).values({
            businessId: userBusiness[0].id,
            name: transaction.description,
            type: transaction.category,
            currentValue: transaction.amount.toString(),
            purchaseValue: transaction.amount.toString(),
            purchaseDate: new Date(transaction.date),
            description: transaction.notes,
            documents: [],
          }).returning();
          savedTransaction = newAsset;
        }

        if (savedTransaction) {
          savedTransactions.push(savedTransaction);
        }
      } catch (error) {
        console.error("Error saving transaction:", error);
        // Continue with other transactions even if one fails
      }
    }

    // Generate response message
    let responseMessage = "";

    if (savedTransactions.length > 0) {
      const count = savedTransactions.length;
      responseMessage = `I've successfully saved ${count} transaction${count > 1 ? 's' : ''} to your business records:\n\n`;

      for (let i = 0; i < savedTransactions.length; i++) {
        const transaction = parsedData.transactions[i];
        responseMessage += `${i + 1}. ${transaction.type === 'expense' ? '💸 Expense' : transaction.type === 'income' ? '💰 Income' : '🏢 Asset'}: $${transaction.amount} for ${transaction.description}\n`;
      }

      if (parsedData.followUpQuestions && parsedData.followUpQuestions.length > 0) {
        responseMessage += "\n\nI have a few questions to help categorize this better:\n";
        parsedData.followUpQuestions.forEach((q, i) => {
          responseMessage += `${i + 1}. ${q}\n`;
        });
      }
    } else {
      responseMessage = "I wasn't able to save any transactions. Could you provide more details about the transaction, such as the amount and what it was for?";
    }

    if (parsedData.confidence < 0.7) {
      responseMessage += "\n\nI wasn't completely confident about this categorization. You can edit or verify these transactions in your dashboard.";
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      transactions: savedTransactions,
      followUpQuestions: parsedData.followUpQuestions || [],
      confidence: parsedData.confidence,
    });
  } catch (error) {
    console.error("Transaction processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get recent transactions
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // expense, income, asset

    let recentTransactions = [];

    if (!type || type === 'expense') {
      const expenses = await db
        .select()
        .from(expense)
        .where(eq(expense.businessId, userBusiness[0].id))
        .orderBy(expense.createdAt)
        .limit(limit);
      recentTransactions.push(...expenses);
    }

    if (!type || type === 'income') {
      const incomes = await db
        .select()
        .from(income)
        .where(eq(income.businessId, userBusiness[0].id))
        .orderBy(income.createdAt)
        .limit(limit);
      recentTransactions.push(...incomes);
    }

    if (!type || type === 'asset') {
      const assets = await db
        .select()
        .from(asset)
        .where(eq(asset.businessId, userBusiness[0].id))
        .orderBy(asset.createdAt)
        .limit(limit);
      recentTransactions.push(...assets);
    }

    // Sort by date (most recent first)
    recentTransactions.sort((a, b) =>
      new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );

    return NextResponse.json({
      transactions: recentTransactions.slice(0, limit),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}