"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Transaction {
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
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactionsTable({ transactions, currency }: RecentTransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income" | "asset">("all");

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "expense":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "asset":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants = {
      income: "bg-green-100 text-green-700 border-green-200",
      expense: "bg-red-100 text-red-700 border-red-200",
      asset: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
      <Badge className={`text-xs ${variants[type as keyof typeof variants] || "bg-gray-100 text-gray-700"}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      case "asset":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (transaction.client?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const matchesFilter = filterType === "all" || transaction.type === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle amount sorting
      if (sortField === "amount") {
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
      }

      // Handle date sorting
      if (sortField === "date") {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const transactionCounts = {
    total: transactions.length,
    income: transactions.filter(t => t.type === "income").length,
    expenses: transactions.filter(t => t.type === "expense").length,
    assets: transactions.filter(t => t.type === "asset").length,
  };

  if (transactions.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <div className="text-gray-400 dark:text-gray-600 mb-2">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start by adding some expenses, income, or assets</p>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <a href="/chat">Add Transaction</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterType === "all" ? "All Types" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                All Types ({transactionCounts.total})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("income")}>
                Income ({transactionCounts.income})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("expense")}>
                Expenses ({transactionCounts.expenses})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("asset")}>
                Assets ({transactionCounts.assets})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Income</p>
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(
              transactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            )}
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Expenses</p>
          <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
            {formatCurrency(
              transactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            )}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Assets</p>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(
              transactions
                .filter(t => t.type === "asset")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            )}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Net Flow</p>
          <p className={`text-sm font-bold ${
            transactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0) -
              transactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0) >= 0
              ? 'text-purple-900 dark:text-purple-100'
              : 'text-red-900 dark:text-red-100'
          }`}>
            {formatCurrency(
              transactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0) -
              transactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("description")}
                  className="h-auto p-0 font-semibold"
                >
                  Description
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("amount")}
                  className="h-auto p-0 font-semibold"
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="h-auto p-0 font-semibold"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.slice(0, 10).map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    {getTransactionBadge(transaction.type)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <p className="text-sm">{transaction.description}</p>
                    {transaction.vendor && (
                      <p className="text-xs text-gray-500">Vendor: {transaction.vendor}</p>
                    )}
                    {transaction.client && (
                      <p className="text-xs text-gray-500">Client: {transaction.client}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{transaction.category}</span>
                </TableCell>
                <TableCell className={`font-medium ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{formatDate(transaction.date)}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(transaction.date)}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredTransactions.length > 10 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Transactions ({filteredTransactions.length})
          </Button>
        </div>
      )}
    </div>
  );
}