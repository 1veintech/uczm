"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Users,
  Flame,
  ShoppingBag,
  DollarSign,
  QrCode,
  Menu,
  X,
  Bell,
  ChevronRight,
  LogOut,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "核心模块",
    items: [
      { title: "工作台", href: "/station", icon: LayoutDashboard },
      { title: "客诉管理", href: "/station/complaints", icon: MessageSquareWarning },
      { title: "招聘管理", href: "/station/recruitment", icon: Users },
    ],
  },
  {
    label: "业务管理",
    items: [
      { title: "爆品管理", href: "/station/hot-products", icon: Flame },
      { title: "商城管理", href: "/station/mall/products", icon: ShoppingBag },
      { title: "订单管理", href: "/station/mall/orders", icon: ShoppingCart },
    ],
  },
  {
    label: "其他",
    items: [
      { title: "收入统计", href: "/station/income", icon: DollarSign },
      { title: "我的二维码", href: "/station/qr-code", icon: QrCode },
      { title: "个人设置", href: "/station/settings", icon: Settings },
    ],
  },
];

function getPageTitle(pathname: string): string {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.href === "/station") {
        if (pathname === "/station") return item.title;
      } else if (pathname.startsWith(item.href)) {
        return item.title;
      }
    }
  }
  return "工作台";
}

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = getPageTitle(pathname);
  const { data: session } = useSession();

  const userName = session?.user?.name || "站长";
  const userInitial = userName.charAt(0);

  return (
    <div className="flex h-screen bg-[#F6F8FC] text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          "bg-gradient-to-b from-[#07111F] via-[#0B1728] to-[#10233C]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">优采智管</h1>
              <p className="text-[11px] text-slate-400">站长管理后台</p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-hide">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/station"
                        ? pathname === "/station"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-blue-500/15 text-blue-400 shadow-sm"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            isActive ? "text-blue-400" : "text-slate-500"
                          )}
                        />
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-[11px] text-slate-400 truncate">站长</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/home" })}
              className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/86 px-4 shadow-sm backdrop-blur lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Link href="/station" className="hover:text-blue-500 transition-colors">
                  首页
                </Link>
                {pathname !== "/station" && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-500">{pageTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <Avatar size="sm">
                <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-[11px] text-gray-400">站长</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#F6F8FC] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
