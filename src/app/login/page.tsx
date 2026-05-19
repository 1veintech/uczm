"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Zap,
  BarChart3,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    label: "超级管理员",
    email: "admin@ddcm.com",
    password: "admin123",
    color: "from-blue-500 to-blue-600",
    path: "/admin",
  },
  {
    label: "区县代理",
    email: "agent@ddcm.com",
    password: "agent123",
    color: "from-emerald-500 to-emerald-600",
    path: "/agent",
  },
  {
    label: "站长",
    email: "zhang@ddcm.com",
    password: "station123",
    color: "from-amber-500 to-amber-600",
    path: "/station",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mobile" | "admin">("mobile");
  const [loading, setLoading] = useState(false);

  // C-end: phone + code
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Admin: email + password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (phone.length !== 11) return;
    setCodeSent(true);
    setCountdown(60);
  };

  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    if (!code) {
      setError("请输入验证码");
      return;
    }
    if (code.length < 4) {
      setError("验证码格式不正确");
      return;
    }
    setLoading(true);
    const userInfo = {
      nickname: `用户${phone.slice(-4)}`,
      phone,
    };
    localStorage.setItem("c_user", JSON.stringify(userInfo));
    router.push("/");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );
    if (account) {
      localStorage.setItem("user", JSON.stringify(account));
      router.push(account.path);
    } else {
      setError("账号或密码错误");
      setLoading(false);
    }
  };

  const quickLogin = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    // 直接登录
    setLoading(true);
    localStorage.setItem("user", JSON.stringify(account));
    router.push(account.path);
  };

  const quickMobileLogin = (phoneNumber: string) => {
    setLoading(true);
    const userInfo = {
      nickname: `用户${phoneNumber.slice(-4)}`,
      phone: phoneNumber,
    };
    localStorage.setItem("c_user", JSON.stringify(userInfo));
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Tab switcher */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex bg-white/10 rounded-full p-1 backdrop-blur-sm z-20">
        <button
          onClick={() => { setActiveTab("mobile"); setError(""); }}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "mobile"
              ? "bg-white text-[#0F172A] shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          C端客户
        </button>
        <button
          onClick={() => { setActiveTab("admin"); setError(""); }}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "admin"
              ? "bg-white text-[#0F172A] shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          管理后台
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 ${
              activeTab === "mobile"
                ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
                : "bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-700/30"
            }`}>
              {activeTab === "mobile" ? (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 12c-3 0-6 2.5-6 6s2.5 6 6 6 6-2.5 6-6-3-6-6-6z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 18c-1.5.5-3 2-3 4s1.5 3.5 3 4 3 0 4-1-2-2.5-2-4-1-3-2-4-2.5-.5-4 1z" fill="white" fillOpacity="0.6"/>
                  <path d="M28 18c1.5.5 3 2 3 4s-1.5 3.5-3 4-3 0-4-1 2-2.5 2-4 1-3 2-4 2.5-.5 4 1z" fill="white" fillOpacity="0.6"/>
                  <path d="M20 8c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12z" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"/>
                </svg>
              ) : (
                <Shield className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {activeTab === "mobile" ? "优采智管" : "运营管理系统"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === "mobile"
                ? "手机号验证码登录，快捷方便"
                : "高效管理 · 智能运营 · 数据驱动"}
            </p>
          </div>

          {activeTab === "mobile" ? (
            /* C端: 手机号 + 验证码 */
            <form onSubmit={handleMobileLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入手机号"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入验证码"
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={phone.length !== 11 || countdown > 0}
                  className="absolute inset-y-1.5 right-1.5 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-50 text-blue-500 hover:bg-blue-100"
                >
                  {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "登录中..." : <><LogIn className="w-4 h-4" />登录</>}
              </button>
            </form>
          ) : (
            /* 管理后台: 邮箱 + 密码 */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入账号/邮箱"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "登录中..." : <><ArrowRight className="w-4 h-4" />登 录</>}
              </button>
            </form>
          )}

          {/* 快速体验 */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">
              {activeTab === "mobile" ? "快速体验 · 点击自动登录" : "快速体验 · 点击自动登录"}
            </p>
            <div className="space-y-2">
              {activeTab === "mobile" ? (
                <>
                  <button
                    onClick={() => quickMobileLogin("13900001111")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      王
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">小王（客户）</div>
                      <div className="text-xs text-slate-400">139****1111</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                  <button
                    onClick={() => quickMobileLogin("13800000002")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      李
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">李姐（客户）</div>
                      <div className="text-xs text-slate-400">138****0002</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                </>
              ) : (
                DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => quickLogin(account)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {account.label.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{account.label}</div>
                      <div className="text-xs text-slate-400">{account.email}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom features */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Shield className="w-4 h-4" />
            <span>安全可靠</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Zap className="w-4 h-4" />
            <span>高效稳定</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <BarChart3 className="w-4 h-4" />
            <span>智能分析</span>
          </div>
        </div>
      </div>
    </div>
  );
}
