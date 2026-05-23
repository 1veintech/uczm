"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Phone,
  Shield,
  UserPlus,
  Zap,
} from "lucide-react";

export function HomeLoginPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mobile" | "admin">("mobile");
  const [loginType, setLoginType] = useState<"code" | "password">("code");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const resetError = () => setError("");

  const handleSendCode = async () => {
    if (phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }

    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.success) {
        setCodeSent(true);
        setCountdown(60);
        setDevCode(data.code || "");
      } else {
        setError(data.message || "发送失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleMobileCodeLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    if (code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "c_user",
          JSON.stringify({ nickname: `用户${phone.slice(-4)}`, phone }),
        );
        router.push("/");
      } else {
        setError(data.message || "验证码错误");
        setLoading(false);
      }
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  const handleMobilePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    if (!mobilePassword) {
      setError("请输入密码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: mobilePassword }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "登录失败");
        setLoading(false);
        return;
      }

      const userInfo = {
        nickname: data.customer.nickname || `用户${phone.slice(-4)}`,
        phone,
      };
      localStorage.setItem("c_user", JSON.stringify(userInfo));
      router.push("/");
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("请输入账号");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("账号或密码错误");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      const pathMap: Record<string, string> = {
        SUPER_ADMIN: "/admin",
        COUNTY_AGENT: "/agent",
        STATION_MASTER: "/station",
      };

      if (role && pathMap[role]) {
        router.push(pathMap[role]);
      } else {
        setError("未知用户角色");
        setLoading(false);
      }
    } catch {
      setError("登录失败，请重试");
      setLoading(false);
    }
  };

  return (
    <section
      id="home-login"
      className="relative self-end scroll-mt-8 overflow-hidden rounded-[28px] border border-white/35 bg-white/[0.86] p-1 shadow-[0_28px_90px_rgba(5,19,38,0.35)] backdrop-blur-2xl"
      aria-label="登录"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.74),rgba(236,248,255,0.5)_48%,rgba(219,234,254,0.38))]" />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(14,116,144,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.1)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative rounded-[24px] border border-white/60 bg-white/58 p-5 shadow-inner shadow-white/40">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/70 bg-slate-900/[0.04] p-1 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActiveTab("mobile");
            resetError();
          }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "mobile"
              ? "bg-white text-slate-950 shadow-lg shadow-blue-950/10 ring-1 ring-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          客户登录
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("admin");
            resetError();
          }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "admin"
              ? "bg-white text-blue-600 shadow-lg shadow-blue-950/10 ring-1 ring-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          管理后台
        </button>
      </div>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 shadow-[0_16px_32px_rgba(37,99,235,0.34)] ring-1 ring-white/60">
          {activeTab === "mobile" ? (
            <Phone className="h-8 w-8 text-white" />
          ) : (
            <Shield className="h-8 w-8 text-white" />
          )}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
          <BadgeCheck className="h-3.5 w-3.5" />
          统一身份入口
        </div>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">优采智管</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {activeTab === "mobile" ? "优采赋能，智管全域" : "高效管理 · 智能运营 · 数据驱动"}
        </p>
      </div>

      {activeTab === "mobile" ? (
        <div className="space-y-4">
          <div className="flex rounded-2xl border border-slate-200/70 bg-white/62 p-1 shadow-inner shadow-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setLoginType("code");
                resetError();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                loginType === "code" ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "text-slate-500"
              }`}
            >
              <Phone className="h-4 w-4" />
              验证码登录
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("password");
                resetError();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                loginType === "password" ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "text-slate-500"
              }`}
            >
              <KeyRound className="h-4 w-4" />
              密码登录
            </button>
          </div>

          {loginType === "code" ? (
            <form onSubmit={handleMobileCodeLogin} className="space-y-4">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入手机号"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>

              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入验证码"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-28 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={phone.length !== 11 || countdown > 0 || sending}
                  className="absolute bottom-2 right-2 top-2 rounded-xl bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? "发送中..." : countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
                </button>
              </div>

              {devCode && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                  <p className="mb-1 text-xs text-amber-600">短信验证码（演示模式）</p>
                  <p className="text-2xl font-bold tracking-widest text-amber-700">{devCode}</p>
                </div>
              )}

              {error && <div className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700 py-4 font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(37,99,235,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "登录中..." : <><LogIn className="h-4 w-4" />登录</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMobilePasswordLogin} className="space-y-4">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入手机号"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>

              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={mobilePassword}
                  onChange={(e) => setMobilePassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-12 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>

              {error && <div className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700 py-4 font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(37,99,235,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "登录中..." : <><LogIn className="h-4 w-4" />登录</>}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white/66 py-3 font-semibold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4" />
            没有账号？立即注册
          </button>
        </div>
      ) : (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <Shield className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入账号/邮箱"
              className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
          </div>

          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-12 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex items-center pr-4"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700 py-4 font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(37,99,235,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "登录中..." : <><ArrowRight className="h-4 w-4" />登 录</>}
          </button>
        </form>
      )}

      <div className="mt-5 flex justify-center gap-5 border-t border-white/70 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          安全可靠
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Zap className="h-3.5 w-3.5" />
          高效稳定
        </span>
      </div>
      </div>
    </section>
  );
}
