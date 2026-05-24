"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function MobileLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MobileLoginContent />
    </Suspense>
  );
}

function MobileLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/profile";
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const sendCode = async () => {
    if (phone.length !== 11) {
      setMessage("请输入正确的手机号");
      return;
    }
    setMessage("");
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
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage(data.message || "发送失败");
      }
    } catch {
      setMessage("网络错误，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (phone.length !== 11) {
      setMessage("请输入正确的手机号");
      return;
    }
    if (code.length !== 6) {
      setMessage("请输入6位验证码");
      return;
    }

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
        router.replace(redirectTo);
      } else {
        setMessage(data.message || "验证码错误或已过期");
        setLoading(false);
      }
    } catch {
      setMessage("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mini-premium-bg px-4 pb-8 pt-4">
      <div className="mx-auto max-w-md">
        <Link href="/profile" className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-slate-600 shadow-sm">
          <ArrowLeft size={18} />
        </Link>

        <section className="mini-glass-panel-dark p-5 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/14 shadow-lg backdrop-blur-md">
            <ShieldCheck size={30} />
          </div>
          <p className="mt-5 text-xs tracking-[0.2em] text-white/60">CUSTOMER LOGIN</p>
          <h1 className="mt-2 text-2xl font-semibold">客户登录</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            登录后可提交售后、查看订单、报名招聘和管理地址。
          </p>
        </section>

        <form onSubmit={handleLogin} className="mini-glass-panel mt-4 p-4">
          <label className="text-xs font-medium text-slate-500">手机号</label>
          <div className="relative mt-2">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="请输入手机号"
              className="mini-input h-12 w-full pl-10 pr-4 text-sm placeholder:text-slate-400"
            />
          </div>

          <label className="mt-4 block text-xs font-medium text-slate-500">验证码</label>
          <div className="mt-2 flex gap-3">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="请输入验证码"
              className="mini-input h-12 min-w-0 flex-1 px-4 text-sm placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={sendCode}
              disabled={phone.length !== 11 || countdown > 0}
              className="rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-600 disabled:opacity-45"
            >
              {countdown > 0 ? `${countdown}s` : codeSent ? "重发" : "获取"}
            </button>
          </div>

          {message && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-center text-xs text-rose-500">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "登录中..." : "登录"}
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            演示环境输入任意6位验证码即可登录
          </p>
        </form>
      </div>
    </main>
  );
}
