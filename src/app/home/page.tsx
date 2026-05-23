import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Layers3,
  Map,
  Shield,
  Smartphone,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { HomeLoginPanel } from "./home-login-panel";

const interfaces = [
  {
    href: "/",
    icon: Smartphone,
    label: "C端客户",
    desc: "售后报损、商城下单、招聘浏览与订单追踪",
    metric: "移动端",
    color: "from-sky-500 to-blue-600",
  },
  {
    href: "/station",
    icon: Store,
    label: "站长后台",
    desc: "客诉处理、商品订单、招聘发布与收入统计",
    metric: "经营台",
    color: "from-blue-600 to-indigo-600",
  },
  {
    href: "/agent",
    icon: Users,
    label: "代理后台",
    desc: "站点巡检、区域地图、收入结算与物料管理",
    metric: "区域管控",
    color: "from-teal-500 to-emerald-600",
  },
  {
    href: "/admin",
    icon: Shield,
    label: "超级后台",
    desc: "代理体系、财务审核、版本定价与系统配置",
    metric: "总部视角",
    color: "from-slate-700 to-blue-900",
  },
];

const capabilities = [
  { icon: Zap, label: "分钟级响应", value: "客诉闭环" },
  { icon: Map, label: "区域可视化", value: "站点掌控" },
  { icon: BarChart3, label: "经营数据", value: "实时看板" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F6F8FC] text-slate-950">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(45,212,191,0.26),transparent_28%),radial-gradient(circle_at_76%_10%,rgba(59,130,246,0.34),transparent_30%),radial-gradient(circle_at_86%_72%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,#06111D,#0B213A_46%,#0E3A5C)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute left-1/2 top-20 hidden h-72 w-72 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-cyan-300/5 blur-sm md:block" />
        <div className="absolute bottom-16 left-[8%] hidden w-64 rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md lg:block">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
            <span>服务链路</span>
            <span className="text-emerald-300">98.7%</span>
          </div>
          <div className="space-y-2">
            {["售后接入", "站长处理", "财务结算"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span className="w-16 text-xs text-slate-200">{item}</span>
                <span
                  className="h-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                  style={{ width: `${84 - index * 13}px` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute right-[12%] top-28 hidden w-56 rounded-lg border border-white/10 bg-slate-950/25 p-4 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-md xl:block">
          <p className="text-xs text-slate-300">今日经营额</p>
          <p className="mt-2 text-3xl font-semibold">¥86,420</p>
          <p className="mt-1 text-xs text-emerald-300">较昨日 +18.6%</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F6F8FC] to-transparent" />

        <div className="relative mx-auto grid min-h-[620px] max-w-6xl gap-8 px-5 pb-28 pt-7 md:grid-cols-[1fr_440px] md:px-8 md:pt-10">
          <div className="flex flex-col justify-between">
            <nav className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">优采智管</p>
                  <p className="text-xs text-sky-100/70">私域经营中枢</p>
                </div>
              </div>
              <a
                href="#home-login"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-slate-900 shadow-xl shadow-blue-950/20 transition hover:bg-sky-50"
              >
                登录
                <ArrowRight className="h-4 w-4" />
              </a>
            </nav>

            <div className="max-w-2xl py-16 text-white md:py-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-sky-50 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                覆盖客户、站长、代理与总部的一体化系统
              </div>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                优采智管
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                把售后、商城、招聘、区域与财务结算收束到同一个高效工作台，
                让站点经营更清晰，管理动作更可追踪。
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {capabilities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-lg border border-white/15 bg-white/[0.09] p-3 shadow-lg shadow-slate-950/10 backdrop-blur-md"
                    >
                      <Icon className="h-4 w-4 text-sky-200" />
                      <p className="mt-3 text-sm font-semibold">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <HomeLoginPanel />
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 pb-12 md:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {interfaces.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <article className="premium-panel h-full rounded-lg p-4 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-lg shadow-blue-900/10`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {item.metric}
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-slate-950">{item.label}</h2>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{item.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                    进入工作台
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white/72 px-4 py-3 text-sm text-slate-500 shadow-sm md:flex-row md:items-center">
          <span>优采智管私域管理系统 v1.0</span>
          <div className="flex flex-wrap gap-2">
            {["售后协同", "订单经营", "区域管理", "财务结算"].map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
