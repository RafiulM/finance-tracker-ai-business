"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface SummaryData {
  totalExpenses: number;
  totalIncome: number;
  totalAssets: number;
  netWorth: number;
}

interface SummaryCardsProps {
  data: SummaryData;
  currency: string;
}

export function SummaryCards({ data, currency }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (value: number, isExpense = false) => {
    if (value > 0) {
      return isExpense ? (
        <ArrowUpRight className="h-4 w-4 text-red-500" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-green-500" />
      );
    } else if (value < 0) {
      return isExpense ? (
        <ArrowDownRight className="h-4 w-4 text-green-500" />
      ) : (
        <ArrowDownRight className="h-4 w-4 text-red-500" />
      );
    }
    return null;
  };

  const cards = [
    {
      title: "Total Income",
      value: data.totalIncome,
      currency: currency,
      icon: TrendingUp,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-700 dark:text-emerald-400",
      textColor: "text-emerald-900 dark:text-emerald-100",
      trend: {
        value: 12.5,
        isPositive: true,
        label: "vs last month"
      }
    },
    {
      title: "Total Expenses",
      value: data.totalExpenses,
      currency: currency,
      icon: TrendingDown,
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-800",
      iconBg: "bg-rose-100 dark:bg-rose-900/50",
      iconColor: "text-rose-700 dark:text-rose-400",
      textColor: "text-rose-900 dark:text-rose-100",
      trend: {
        value: -8.2,
        isPositive: false,
        label: "vs last month"
      }
    },
    {
      title: "Total Assets",
      value: data.totalAssets,
      currency: currency,
      icon: Wallet,
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-700 dark:text-blue-400",
      textColor: "text-blue-900 dark:text-blue-100",
      trend: {
        value: 5.7,
        isPositive: true,
        label: "vs last month"
      }
    },
    {
      title: "Net Worth",
      value: data.netWorth,
      currency: currency,
      icon: DollarSign,
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-700 dark:text-purple-400",
      textColor: "text-purple-900 dark:text-purple-100",
      trend: {
        value: data.netWorth >= 0 ? 15.3 : -12.8,
        isPositive: data.netWorth >= 0,
        label: "vs last month"
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositiveNet = card.title === "Net Worth" ? data.netWorth >= 0 : card.trend.isPositive;

        return (
          <Card
            key={index}
            className={`${card.bgColor} ${card.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                    {card.trend.value !== 0 && (
                      <Badge
                        variant="outline"
                        className={`${
                          isPositiveNet
                            ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
                            : 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
                        } text-xs`}
                      >
                        <span className="flex items-center gap-1">
                          {getTrendIcon(card.trend.value, card.title === "Total Expenses")}
                          {Math.abs(card.trend.value)}%
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {formatCurrency(card.value)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.trend.label}
                  </p>
                </div>

                <div className={`h-12 w-12 ${card.iconBg} rounded-full flex items-center justify-center ml-4`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      card.title === "Total Expenses"
                        ? 'bg-red-400'
                        : card.title === "Net Worth"
                        ? (data.netWorth >= 0 ? 'bg-purple-400' : 'bg-red-400')
                        : 'bg-green-400'
                    } rounded-full transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, Math.max(10, (card.value / Math.max(...cards.map(c => c.value))) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}