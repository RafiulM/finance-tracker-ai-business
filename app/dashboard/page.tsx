"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  MessageCircleHeart
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

// Import our dashboard components
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactionsTable } from "@/components/dashboard/recent-transactions-table";

interface DashboardData {
  summary: {
    totalExpenses: number;
    totalIncome: number;
    totalAssets: number;
    netWorth: number;
  };
  monthlyData: Array<{
    month: string;
    expenses: number;
    income: number;
    netCashFlow: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: "expense" | "income" | "asset";
    amount: string;
    date: string;
    category: string;
    description: string;
    vendor?: string;
    client?: string;
    createdAt?: string;
    purchaseDate?: string;
  }>;
  businessName: string;
  currency: string;
  dateRange: {
    start: string;
    end: string;
    months: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your business finances today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="h-8" asChild>
            <Link href="/chat">
              <MessageCircleHeart className="h-4 w-4 mr-2" />
              AI Chat
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data.summary} currency={data.currency} />

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Cash Flow Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cash Flow Overview
            </CardTitle>
            <CardDescription>
              Monthly income vs expenses for the last {data.dateRange.months} months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <CashFlowChart data={data.monthlyData} currency={data.currency} />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              Top spending categories this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.categoryBreakdown} currency={data.currency} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest financial activity across all categories
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <a href="/api/export/csv" target="_blank">
                <Download className="h-4 w-4 mr-2" />
                Export
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RecentTransactionsTable
            transactions={data.recentTransactions}
            currency={data.currency}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-primary bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quick Add</p>
                <p className="text-2xl font-bold">Transaction</p>
              </div>
              <Button className="h-8 w-8 rounded-lg p-0" asChild>
                <Link href="/chat">
                  <DollarSign className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600 bg-card dark:bg-blue-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold">Analysis</p>
              </div>
              <Button className="h-8 w-8 rounded-lg p-0 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/chat">
                  <TrendingUp className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-emerald-600 bg-card dark:bg-emerald-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold">{data.currency}{data.summary.netWorth.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-600 bg-card dark:bg-orange-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Period</p>
                <p className="text-2xl font-bold">{data.dateRange.months} months</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}