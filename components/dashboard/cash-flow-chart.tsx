"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { format, parse } from "date-fns";

interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
  netCashFlow: number;
}

interface CashFlowChartProps {
  data: MonthlyData[];
  currency: string;
}

export function CashFlowChart({ data, currency }: CashFlowChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format the month strings for display
  const formattedData = data.map(item => ({
    ...item,
    displayMonth: format(parse(item.month, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM yyyy')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full`}
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 capitalize">
                  {entry.name === 'income' ? 'Income' : entry.name === 'expenses' ? 'Expenses' : 'Net Cash Flow'}
                </span>
              </div>
              <span className={`text-sm font-medium ${
                entry.name === 'expenses' ? 'text-red-600' :
                entry.name === 'income' ? 'text-green-600' :
                entry.value >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const averageIncome = totalIncome / data.length;
  const averageExpenses = totalExpenses / data.length;

  return (
    <div className="w-full h-80">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Income</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(averageIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Expenses</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(averageExpenses)}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Monthly Averages
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="netFlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="displayMonth"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            name="income"
          />

          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            name="expenses"
          />

          <Line
            type="monotone"
            dataKey="netCashFlow"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', r: 3 }}
            name="netCashFlow"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-medium">Total Income</p>
          <p className="text-sm font-bold text-green-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-600 font-medium">Total Expenses</p>
          <p className="text-sm font-bold text-red-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">Net Cash Flow</p>
          <p className={`text-sm font-bold ${totalIncome - totalExpenses >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>
    </div>
  );
}