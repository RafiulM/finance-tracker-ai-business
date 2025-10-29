"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PieChartIcon, BarChart3 } from "lucide-react";

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  currency: string;
}

const COLORS = [
  "#10b981", // Emerald green
  "#059669", // Emerald 600
  "#047857", // Emerald 700
  "#065f46", // Emerald 800
  "#064e3b", // Emerald 900
  "#34d399", // Emerald 400
  "#6ee7b7", // Emerald 300
  "#a7f3d0", // Emerald 200
  "#d1fae5", // Emerald 100
  "#ecfdf5", // Emerald 50
];

export function CategoryChart({ data, currency }: CategoryChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{data.category}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(data.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {data.count} transactions
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Percentage:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  // Sort data by amount for better visualization
  const sortedData = [...data].sort((a, b) => b.amount - a.amount).slice(0, 8);

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <PieChartIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No expense data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Add some expenses to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Transactions:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {totalTransactions}
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
            className="h-8 px-3"
          >
            <PieChartIcon className="h-3 w-3" />
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="h-8 px-3"
          >
            <BarChart3 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="amount"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={60}
              formatter={(value: string) => (
                <span className="text-xs text-gray-700">
                  {value.length > 15 ? `${value.slice(0, 15)}...` : value}
                </span>
              )}
            />
          </PieChart>
        ) : (
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Top Categories */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {sortedData.slice(0, 4).map((category, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {category.category}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(category.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}