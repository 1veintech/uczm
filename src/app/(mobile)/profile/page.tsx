"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Info,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageSquareText,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

interface UserInfo {
  nickname: string;
  phone: string;
}

const orderStatusItems = [
  { icon: CreditCard, label: "待付款", statusKey: "UNPAID", href: "/orders" },
  { icon: Package, label: "待发货", statusKey: "PAID", href: "/orders" },
  { icon: Truck, label: "已发货", statusKey: "SHIPPED", href: "/orders" },
  { icon: CheckCircle, label: "已完成", statusKey: "COMPLETED", href: "/orders" },
];

const menuItems = [
  { icon: Package, label: "我的订单", desc: "查看购物记录和物流", href: "/orders", color: "bg-blue-50 text-blue-600" },
  { icon: MessageSquareText, label: "售后记录", desc: "查看报损处理进度", href: "/complaint/history", color: "bg-rose-50 text-rose-500" },
  { icon: MapPin, label: "收货地址", desc: "管理常用收货地址", href: "/address", color: "bg-emerald-50 text-emerald-600" },
  { icon: MessageSquareText, label: "提交售后", desc: "问题在站内流转处理", href: "/complaint", color: "bg-amber-50 text-amber-600" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [serviceRange, setServiceRange] = useState("未登录");
  const itemCount = useCart((s) => s.getItemCount());

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => setUser(parsed));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (user?.phone) {
      fetch(`/api/orders/count?phone=${user.phone}`)
        .then((r) => r.json())
        .then((d) => { if (d.counts) setOrderCounts(d.counts); })
        .catch(() => {});
      fetch(`/api/customers/service-range?phone=${user.phone}`)
        .then((r) => r.json())
        .then((d) => { if (d.serviceRange) setServiceRange(d.serviceRange); })
        .catch(() => {});
    } else {
      setOrderCounts({});
      setServiceRange("未登录");
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("c_user");
    setUser(null);
    setShowSettings(false);
    router.replace("/home");
  };

  return (
    <div className="min-h-screen mini-premium-bg pb-6">
      <section className="px-4 pt-4">
        <div className="mini-glass-panel-dark overflow-hidden p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white/14 text-2xl font-bold shadow-lg backdrop-blur-md">
              {user ? user.nickname[0] : <UserPlus size={28} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-[0.18em] text-white/60">MY ACCOUNT</p>
              <h1 className="mt-1 text-xl font-semibold">{user ? user.nickname : "未登录"}</h1>
              <p className="mt-1 truncate text-sm text-white/70">
                {user ? `手机号 ${user.phone}` : "登录后可查看订单、售后和地址"}
              </p>
            </div>
            {!user && (
              <Link
                href="/home"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition active:scale-95"
              >
                登录
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/12 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                <LockKeyhole size={12} />
                手机授权
              </div>
              <p className="mt-1 text-sm font-semibold">{user ? "已完成" : "待授权"}</p>
            </div>
            <div className="rounded-lg bg-white/12 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                <ShieldCheck size={12} />
                服务范围
              </div>
              <p className="mt-1 text-sm font-semibold">{serviceRange}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="mini-glass-panel p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-medium text-blue-600">订单服务</p>
              <h2 className="text-base font-semibold text-slate-950">我的订单</h2>
            </div>
            <Link href="/orders" className="flex items-center gap-1 text-xs font-medium text-blue-600">
              全部 <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {orderStatusItems.map((item) => {
              const Icon = item.icon;
              const count = orderCounts[item.statusKey] || 0;
              return (
                <Link key={item.label} href={item.href} className="rounded-lg bg-white/80 px-2 py-3 text-center transition active:scale-95">
                  <div className="relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon size={16} />
                    {count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-slate-600">{item.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/cart" className="mini-glass-panel p-4 transition active:scale-[0.98]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <ShoppingCart size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">购物车</p>
            <p className="mt-1 text-[11px] text-slate-500">{itemCount} 件商品待结算</p>
          </Link>
          <button onClick={() => setShowSettings(true)} className="mini-glass-panel p-4 text-left transition active:scale-[0.98]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Settings size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">账户设置</p>
            <p className="mt-1 text-[11px] text-slate-500">授权、隐私与退出</p>
          </button>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="mini-glass-panel overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-white/70 ${
                  index !== menuItems.length - 1 ? "border-b border-white/70" : ""
                }`}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                  <Icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="flex-shrink-0 text-slate-300" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="mini-glass-panel overflow-hidden">
          <button onClick={() => setShowAbout(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-white/70">
            <Info size={18} className="text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-700">关于优采智管</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <Link href="/home" className="flex items-center gap-3 border-t border-white/70 px-4 py-3.5 transition active:bg-white/70">
            <BadgeCheck size={18} className="text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-700">切换管理后台</span>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
        </div>
      </section>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-md rounded-t-lg bg-white px-5 pb-8 pt-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">账户设置</h2>
              <button onClick={() => setShowSettings(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <Bell size={17} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">服务通知</p>
                  <p className="text-[11px] text-slate-500">订单、售后和报名进度提醒</p>
                </div>
              </div>
              {user ? (
                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 py-3 text-sm font-semibold text-rose-500">
                  <LogOut size={16} />
                  退出登录
                </button>
              ) : (
                <Link href="/home" className="block w-full rounded-lg bg-slate-950 py-3 text-center text-sm font-semibold text-white">
                  去登录
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6" onClick={() => setShowAbout(false)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900">优采智管</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              站长私域经营系统，覆盖售后报损、站长商场、招聘报名和个人服务中心。
            </p>
            <button onClick={() => setShowAbout(false)} className="mt-5 w-full rounded-lg bg-slate-950 py-3 text-sm font-semibold text-white">
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
