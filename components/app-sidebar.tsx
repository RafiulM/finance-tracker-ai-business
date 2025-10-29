"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import {
  IconDashboard,
  IconChartBar,
  IconMessageCircle,
  IconCreditCard,
  IconTrendingUp,
  IconDownload,
  IconSettings,
  IconDatabase,
  IconReport,
  IconHelp,
  IconSearch,
  IconReceipt,
  IconWallet,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "AI Chat",
      url: "/chat",
      icon: IconMessageCircle,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: IconCreditCard,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReport,
    },
  ],
  navFinance: [
    {
      title: "Income",
      icon: IconTrendingUp,
      url: "/income",
      items: [
        {
          title: "All Income",
          url: "/income",
        },
        {
          title: "By Category",
          url: "/income/categories",
        },
        {
          title: "Recurring Income",
          url: "/income/recurring",
        },
      ],
    },
    {
      title: "Expenses",
      icon: IconReceipt,
      url: "/expenses",
      items: [
        {
          title: "All Expenses",
          url: "/expenses",
        },
        {
          title: "By Category",
          url: "/expenses/categories",
        },
        {
          title: "Recurring Expenses",
          url: "/expenses/recurring",
        },
      ],
    },
    {
      title: "Assets",
      icon: IconWallet,
      url: "/assets",
      items: [
        {
          title: "All Assets",
          url: "/assets",
        },
        {
          title: "By Type",
          url: "/assets/types",
        },
        {
          title: "Depreciation",
          url: "/assets/depreciation",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Export Data",
      url: "/export",
      icon: IconDownload,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "/data",
      icon: IconDatabase,
    },
    {
      name: "API Docs",
      url: "/api-docs",
      icon: IconReport,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <IconTrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base font-semibold">Finance Tracker</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavDocuments items={staticData.navFinance} title="Finance Management" />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
