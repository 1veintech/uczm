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
    // Demo: accept any 6-digit code
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
    setTimeout(() => {
      router.push("/");
    }, 300);
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
      setTimeout(() => {
        router.push(account.path);
      }, 200);
    } else {
      setError("账号或密码错误");
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const quickLogin = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    // Auto login
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(account));
      router.push(account.path);
    }, 300);
  };

  const quickMobileLogin = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setCode("123456");
    setCodeSent(true);
    // Auto login
    setLoading(true);
    const userInfo = {
      nickname: `用户${phoneNumber.slice(-4)}`,
      phone: phoneNumber,
    };
    localStorage.setItem("c_user", JSON.stringify(userInfo));
    setTimeout(() => {
      router.push("/");
    }, 300);
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
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-10">
          <svg viewBox="0 0 1440 200" className="w-full h-full">
            <path fill="#3B82F6" d="M0,200 L0,120 L40,120 L40,80 L80,80 L80,120 L120,120 L120,60 L160,60 L160,100 L200,100 L200,40 L240,40 L240,100 L280,100 L280,70 L320,70 L320,120 L360,120 L360,50 L400,50 L400,90 L440,90 L440,30 L480,30 L480,90 L520,90 L520,110 L560,110 L560,60 L600,60 L600,100 L640,100 L640,45 L680,45 L680,85 L720,85 L720,120 L760,120 L760,70 L800,70 L800,110 L840,110 L840,55 L880,55 L880,95 L920,95 L920,35 L960,35 L960,75 L1000,75 L1000,110 L1040,110 L1040,65 L1080,65 L1080,100 L1120,100 L1120,50 L1160,50 L1160,80 L1200,80 L1200,120 L1240,120 L1240,40 L1280,40 L1280,90 L1320,90 L1320,110 L1360,110 L1360,60 L1400,60 L1400,100 L1440,100 L1440,200 Z" />
          </svg>
        </div>
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
            /* C-end: Phone + Verification Code */
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
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    登录中...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    登录
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Admin: Email + Password */
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" />
                  记住我
                </label>
                <a href="#" className="text-blue-500 hover:text-blue-600">忘记密码？</a>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    登录中...
                  </span>
                ) : (
                  <>
                    登 录
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Other login methods */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400">其他登录方式</span>
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-6">
              {activeTab === "mobile" ? (
                <>
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 01-.255-1.723c0-3.573 3.27-6.47 7.308-6.47.252 0 .5.013.747.037C16.18 4.859 12.775 2.188 8.691 2.188z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-slate-500">微信登录</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-slate-500">QQ登录</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-slate-500">Apple登录</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 01-.255-1.723c0-3.573 3.27-6.47 7.308-6.47.252 0 .5.013.747.037C16.18 4.859 12.775 2.188 8.691 2.188z"/>
                    </svg>
                    <span className="text-sm text-green-600">微信</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span className="text-sm text-blue-600">QQ</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>
                    </svg>
                    <span className="text-sm text-slate-600">支付宝</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">
              {activeTab === "mobile" ? "快速体验 · 点击填充手机号" : "快速体验 · 点击填充账号"}
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
