"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Calendar,
  TrendingUp,
  Download,
  Settings,
  User,
  LogOut,
  Bell
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface DashboardHeaderProps {
  businessName: string;
  currency: string;
  dateRange: {
    start: string;
    end: string;
    months: number;
  };
  onRefresh: () => void;
}

export function DashboardHeader({
  businessName,
  currency,
  dateRange,
  onRefresh
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDateRange = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Date Range */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {businessName} • {formatDateRange()}
            </p>
          </div>

          <Badge variant="outline" className="border-green-200 text-green-700">
            <Calendar className="h-3 w-3 mr-1" />
            {dateRange.months} months
          </Badge>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:text-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/export/csv" target="_blank">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/export/pdf" target="_blank">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/export/excel" target="_blank">
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:text-green-700 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:text-green-700">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/billing">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Billing & Plans
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/sign-out">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Currency</p>
              <p className="text-lg font-bold text-green-900">{currency}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Last Updated</p>
              <p className="text-sm font-medium text-blue-900">
                {formatDistanceToNow(new Date(), { addSuffix: true })}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Data Period</p>
              <p className="text-sm font-medium text-purple-900">{dateRange.months} months</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">Business</p>
              <p className="text-sm font-medium text-orange-900 truncate max-w-[120px]">
                {businessName}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}