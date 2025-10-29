"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  MessageSquare,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  CreditCard,
  PiggyBank
} from "lucide-react";

interface DashboardSidebarProps {
  businessName: string;
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    current: true,
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
    current: false,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    current: false,
  },
  {
    name: "Export",
    href: "/export",
    icon: Download,
    current: false,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    current: false,
  },
];

export function DashboardSidebar({ businessName, isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-8 z-10">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="h-6 w-6 rounded-full p-0 bg-white border-green-200 hover:bg-green-50"
        >
          {isOpen ? (
            <ChevronLeft className="h-3 w-3 text-green-600" />
          ) : (
            <ChevronRight className="h-3 w-3 text-green-600" />
          )}
        </Button>
      </div>

      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          {isOpen && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {businessName}
              </h2>
              <p className="text-xs text-gray-500">Finance Tracker</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {isOpen && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.name === "Analytics" && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Pro</Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats (only when open) */}
        {isOpen && (
          <div className="mt-8 px-3">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">Quick Tip</h3>
              </div>
              <p className="text-xs text-green-700">
                Use the AI Chat to quickly add expenses, income, and assets with natural language!
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href="/chat">Try AI Chat</Link>
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Finance Tracker AI
          </div>
        </div>
      )}
    </div>
  );
}

// Import Badge component
import { Badge } from "@/components/ui/badge";