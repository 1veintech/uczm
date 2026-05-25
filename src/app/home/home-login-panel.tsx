"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, LogIn, Phone, UserPlus } from "lucide-react";

export function HomeLoginPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 11) { setError("请输入正确的手机号"); return; }
    if (code.length !== 6) { setError("请输入6位验证码"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "c_user",
          JSON.stringify({
            nickname: data.customer?.nickname || `用户${phone.slice(-4)}`,
            phone,
          })
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

  return (
    <section
      id="home-login"
      className="relative self-end scroll-mt-8 overflow-hidden rounded-[28px] border border-white/35 bg-white/[0.86] p-1 shadow-[0_28px_90px_rgba(5,19,38,0.35)] backdrop-blur-2xl"
      aria-label="客户登录"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.74),rgba(236,248,255,0.5)_48%,rgba(219,234,254,0.38))]" />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(14,116,144,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.1)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative rounded-[24px] border border-white/60 bg-white/58 p-5 shadow-inner shadow-white/40">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 shadow-[0_16px_32px_rgba(37,99,235,0.34)] ring-1 ring-white/60">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            手机号验证码登录
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">优采智管</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">优采赋能，智管全域</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="请输入6位验证码"
              className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-4 pl-12 pr-28 text-sm text-slate-900 shadow-sm shadow-slate-200/60 transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={phone.length !== 11 || countdown > 0 || sending}
              className="absolute inset-y-1.5 right-1.5 rounded-xl bg-blue-50 px-4 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "发送中..." : countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
            </button>
          </div>

          {devCode && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
              <p className="text-xs text-amber-600 mb-1">演示模式验证码</p>
              <p className="text-2xl font-bold text-amber-700 tracking-widest">{devCode}</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700 py-4 font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(37,99,235,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "登录中..." : <><LogIn className="h-4 w-4" />登录</>}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/register")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white/66 py-3 font-semibold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <UserPlus className="h-4 w-4" />
          没有账号？立即注册
        </button>
      </div>

      {/* 管理后台入口 */}
      <div className="relative mt-3 rounded-[24px] border border-white/60 bg-white/40 px-5 py-3 text-center">
        <a href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
          管理后台登录
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
