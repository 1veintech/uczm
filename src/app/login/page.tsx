"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) { setError("请输入账号"); return; }
    if (!password) { setError("请输入密码"); return; }

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
    <div className="flex min-h-screen items-center justify-center bg-[#07111F] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0B1728]/90 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-700/30 mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">优采智管</h1>
            <p className="text-slate-400 text-sm mt-1">管理后台</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">账号</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入管理员邮箱"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : <><LogIn className="w-4 h-4" />登录</>}
            </button>
          </form>

          {/* 底部链接 */}
          <div className="mt-6 text-center">
            <a
              href="/home"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              返回首页
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          优采智管 · 私域经营管理系统
        </p>
      </div>
    </div>
  );
}
