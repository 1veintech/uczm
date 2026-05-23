"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Home, ShoppingBag, User } from "lucide-react";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/mall", label: "商场", icon: ShoppingBag },
  { href: "/jobs", label: "招聘", icon: BriefcaseBusiness },
  { href: "/profile", label: "我的", icon: User },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen mini-premium-bg font-sans">
      <main className="mx-auto max-w-md pb-24">{children}</main>
      <nav className="mini-bottom-bar fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        <div className="mx-auto grid h-[62px] max-w-md grid-cols-4 items-center rounded-lg border border-white/70 bg-white/90 px-2 shadow-[0_-12px_40px_rgba(26,74,139,0.14)] backdrop-blur-xl">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex h-full flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-transparent"
                }`}>
                  <Icon
                    size={21}
                    className={isActive ? "text-white" : "text-slate-400"}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] leading-none ${
                    isActive
                      ? "font-semibold text-blue-600"
                      : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
