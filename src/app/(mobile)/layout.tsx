"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/mall", label: "商城", icon: ShoppingBag },
  { href: "/cart", label: "购物车", icon: ShoppingCart },
  { href: "/profile", label: "我的", icon: User },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const itemCount = useCart((s) => s.getItemCount());

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-md mx-auto pb-20">{children}</main>
      {/* Bottom Tab Bar - mini-program style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center justify-around h-[60px] pb-[env(safe-area-inset-bottom)]">
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
                className="flex flex-col items-center justify-center gap-1 relative w-16 py-1"
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={
                      isActive ? "text-[#3B82F6]" : "text-gray-400"
                    }
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {tab.href === "/cart" && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold px-1 leading-none">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] leading-none ${
                    isActive
                      ? "text-[#3B82F6] font-semibold"
                      : "text-gray-400"
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
