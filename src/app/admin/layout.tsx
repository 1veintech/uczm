"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  KeyRound,
  Menu,
  Bell,
  Crown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    title: "核心模块",
    items: [
      { href: "/admin", label: "工作台", icon: LayoutDashboard },
      { href: "/admin/agents", label: "代理管理", icon: UserCheck },
      { href: "/admin/stations", label: "站长总览", icon: Users },
    ],
  },
  {
    title: "业务管理",
    items: [
      { href: "/admin/plans", label: "版本定价", icon: CreditCard },
      { href: "/admin/finance", label: "财务管理", icon: DollarSign },
    ],
  },
  {
    title: "系统管理",
    items: [
      { href: "/admin/system", label: "系统配置", icon: Settings },
      { href: "/admin/settings", label: "个人设置", icon: KeyRound },
    ],
  },
];

function SidebarContent({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">优采智管</span>
          <span className="text-xs text-slate-400">超级管理后台</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
            <div className="px-5 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </span>
            </div>
            <nav className="space-y-0.5 px-3">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-600/15 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">
              超级管理员
            </span>
            <span className="text-xs text-slate-500">admin@ddcm.com</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/home" })}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-colors"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark flex h-screen overflow-hidden bg-[#07111F]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#07111F] lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 border-white/[0.08] bg-[#07111F] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b border-white/[0.08] bg-[#07111F]/[0.88] px-4 backdrop-blur-sm lg:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden text-slate-400 hover:text-slate-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1" />
          <Button variant="ghost" size="icon-sm" className="relative text-slate-400 hover:text-slate-200">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[linear-gradient(145deg,rgba(37,99,235,0.16),transparent_34%),linear-gradient(180deg,#0B1728,#07111F)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
