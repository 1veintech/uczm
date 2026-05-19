"use client";

import { useState, useEffect } from "react";
import {
  Package,
  MessageSquareText,
  MapPin,
  Phone,
  ChevronRight,
  Settings,
  CreditCard,
  Truck,
  CheckCircle,
  LogOut,
  Shield,
  Bell,
  Palette,
  FileText,
  Info,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface UserInfo {
  nickname: string;
  phone: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Countdown timer for verification code
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (!loginPhone || loginPhone.length !== 11) {
      return;
    }
    setCodeSent(true);
    setCountdown(60);
  };

  const handleLogin = () => {
    if (!loginPhone || !loginCode) return;
    const userInfo: UserInfo = {
      nickname: `用户${loginPhone.slice(-4)}`,
      phone: loginPhone,
    };
    localStorage.setItem("c_user", JSON.stringify(userInfo));
    setUser(userInfo);
    setShowLogin(false);
    setLoginPhone("");
    setLoginCode("");
    setCodeSent(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("c_user");
    setUser(null);
    setShowSettings(false);
  };

  const orderStatusItems = [
    { icon: CreditCard, label: "待付款", count: 0, href: "/orders" },
    { icon: Package, label: "待发货", count: 1, href: "/orders" },
    { icon: Truck, label: "已发货", count: 0, href: "/orders" },
    { icon: CheckCircle, label: "已完成", count: 3, href: "/orders" },
  ];

  const menuItems = [
    { icon: Package, label: "我的订单", desc: "查看全部订单", href: "/orders", color: "bg-blue-50 text-blue-500" },
    { icon: MessageSquareText, label: "售后记录", desc: "查看全部售后", href: "/complaint/history", color: "bg-orange-50 text-orange-500" },
    { icon: MapPin, label: "收货地址", desc: "管理收货地址", href: "/address", color: "bg-emerald-50 text-emerald-500" },
    { icon: Phone, label: "联系站长", desc: "咨询与帮助", href: "tel:13800000002", color: "bg-purple-50 text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* User Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-5 pt-14 pb-8">
        <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-8 right-5 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-4">
          {user ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold">
                  {user.nickname[0]}
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-lg font-bold tracking-wide">{user.nickname}</h1>
                <p className="text-white/70 text-xs mt-1">手机: {user.phone}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <UserPlus size={28} className="text-white/80" />
              </div>
              <div className="text-white flex-1">
                <h1 className="text-lg font-bold tracking-wide">未登录</h1>
                <p className="text-white/70 text-xs mt-1">登录后享受更多服务</p>
              </div>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 text-sm font-medium text-white active:scale-95 transition-transform"
              >
                立即登录
              </button>
            </>
          )}
        </div>

        {/* Order Status Quick Links - only when logged in */}
        {user && (
          <div className="relative z-10 mt-5 grid grid-cols-4 gap-2">
            {orderStatusItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 text-center active:scale-95 transition-transform">
                  <div className="relative inline-flex">
                    <Icon size={20} className="text-white" />
                    {item.count > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-orange-500 text-white text-[9px] font-bold px-1">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/80 mt-1">{item.label}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Menu */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Secondary Menu */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
          {user && (
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors border-b border-gray-50">
              <Settings size={18} className="text-gray-400" />
              <span className="flex-1 text-sm text-gray-700 text-left">设置</span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          )}
          <button onClick={() => setShowAbout(true)} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors border-b border-gray-50">
            <Info size={18} className="text-gray-400" />
            <span className="flex-1 text-sm text-gray-700 text-left">关于优采智管</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <Link href="/home" className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
            <Shield size={18} className="text-gray-400" />
            <span className="flex-1 text-sm text-gray-700 text-left">切换管理后台</span>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </div>

      {/* App Version */}
      <p className="text-center text-[10px] text-gray-300 mt-6 mb-4">优采智管 v1.0.0</p>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">手机号登录</h2>
              <button onClick={() => setShowLogin(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Phone Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">手机号</label>
                <input
                  type="tel"
                  maxLength={11}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入手机号"
                  className="w-full rounded-xl bg-slate-50 border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                />
              </div>

              {/* Verification Code */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">验证码</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入验证码"
                    className="flex-1 rounded-xl bg-slate-50 border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={loginPhone.length !== 11 || countdown > 0}
                    className="flex-shrink-0 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-50 text-blue-500 hover:bg-blue-100 active:scale-95"
                  >
                    {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
                  </button>
                </div>
              </div>

              {/* Demo quick fill */}
              <div className="pt-2">
                <p className="text-[11px] text-gray-400 mb-2">快速体验（点击填充）</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setLoginPhone("13900001111"); setLoginCode("123456"); setCodeSent(true); }}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-500 text-xs font-medium active:scale-95 transition-transform"
                  >
                    139****1111
                  </button>
                  <button
                    onClick={() => { setLoginPhone("13800000002"); setLoginCode("123456"); setCodeSent(true); }}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-500 text-xs font-medium active:scale-95 transition-transform"
                  >
                    138****0002
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={!loginPhone || !loginCode}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                登录
              </button>

              <p className="text-center text-[10px] text-gray-400">
                登录即表示同意《用户协议》和《隐私政策》
              </p>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">设置</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50">
                <Bell size={18} className="text-blue-500" />
                <span className="flex-1 text-sm text-gray-700 text-left">消息通知</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50">
                <Palette size={18} className="text-purple-500" />
                <span className="flex-1 text-sm text-gray-700 text-left">主题设置</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50">
                <FileText size={18} className="text-emerald-500" />
                <span className="flex-1 text-sm text-gray-700 text-left">隐私政策</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <div className="border-t border-gray-100 my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-red-500 active:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span className="flex-1 text-sm text-left">退出登录</span>
              </button>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">关于优采智管</h2>
              <button onClick={() => setShowAbout(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">U</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">优采智管・全域管理系统</h3>
              <p className="text-sm text-gray-500 mt-1">UCZM · Optimal Collection Intelligent Management</p>
              <p className="text-xs text-blue-500 mt-2 font-medium">优采赋能，智管全域</p>
              <p className="text-xs text-gray-400 mt-4">版本: 1.0.0</p>
              <p className="text-xs text-gray-400 mt-1">© 2026 UCZM 版权所有</p>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}
    </div>
  );
}
