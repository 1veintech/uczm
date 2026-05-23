import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { HomeComplaints, HomeStats } from "./home-complaints";

const serviceShortcuts = [
  {
    label: "售后处理",
    desc: "异常订单快速反馈",
    href: "/complaint",
    icon: Headphones,
    color: "from-sky-500 to-blue-600",
  },
  {
    label: "严选商场",
    desc: "站长精选好物",
    href: "/mall",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-500",
  },
  {
    label: "附近岗位",
    desc: "本地岗位直招",
    href: "/jobs",
    icon: BriefcaseBusiness,
    color: "from-indigo-500 to-blue-500",
  },
  {
    label: "订单追踪",
    desc: "履约状态同步",
    href: "/orders",
    icon: Truck,
    color: "from-amber-400 to-orange-500",
  },
];

const fallbackJobs = [
  { title: "分拣员", salary: "¥5k-7k", workLocation: "应县城东站", workLocationDetail: "10:00-19:00" },
  { title: "配送司机", salary: "¥7k-9k", workLocation: "平城区仓配点", workLocationDetail: "08:30-18:30" },
];

export default async function HomePage() {
  const station = await prisma.station.findFirst({
    where: { status: "APPROVED" },
    include: {
      hotProducts: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" }, take: 6 },
      jobs: { where: { status: "HIRING" }, take: 2 },
    },
  });

  if (!station) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-6">
        <p className="text-sm text-slate-500">暂无可用服务站</p>
      </div>
    );
  }

  const activeJobs = station.jobs.length > 0 ? station.jobs : fallbackJobs;
  const hotProductDetailHref = station.hotProducts[0]?.pddPath || "/mall";

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-8 text-slate-950">
      <section className="relative overflow-hidden rounded-b-[32px] bg-[#07111F] px-4 pb-24 pt-5 text-white shadow-[0_26px_70px_rgba(7,17,31,0.34)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(45,212,191,0.28),transparent_30%),radial-gradient(circle_at_92%_16%,rgba(59,130,246,0.34),transparent_34%),linear-gradient(145deg,#07111F_0%,#0B2542_52%,#0D4C68_100%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute -right-16 top-28 h-44 w-44 rounded-full border border-cyan-200/20 bg-cyan-300/10 blur-sm" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20 backdrop-blur">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold">优采智管</p>
              <p className="text-[11px] text-sky-100/70">站长私域服务中枢</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur"
          >
            我的
          </Link>
        </div>

        <div className="relative z-10 pt-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-cyan-50 backdrop-blur">
            <Sparkles size={13} />
            私域经营 · 售后协同 · 本地服务
          </div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.01em]">
            {station.name}
          </h1>
          <p className="mt-3 flex items-start gap-1.5 text-sm leading-6 text-slate-200">
            <MapPin className="mt-1 h-4 w-4 flex-none text-cyan-200" />
            <span>{station.address}</span>
          </p>

          <div className="mt-6 rounded-[24px] border border-white/14 bg-white/[0.09] p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300">今日服务状态</p>
                <p className="mt-1 text-lg font-semibold">售后、商场、招聘统一响应</p>
              </div>
              <span className="rounded-full bg-emerald-400/14 px-3 py-1 text-xs font-semibold text-emerald-200">
                在线
              </span>
            </div>
            <HomeStats hotProductCount={station.hotProducts.length} hotProductHref={hotProductDetailHref} />
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-16 px-4">
        <div className="rounded-[28px] border border-white/80 bg-white/92 p-3 shadow-[0_24px_70px_rgba(15,47,107,0.16)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-medium text-slate-500">快捷入口</p>
              <h2 className="text-base font-semibold text-slate-950">服务模块</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
              4个入口
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {serviceShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-[22px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm transition-transform active:scale-[0.98]"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-blue-500/15`}>
                    <Icon size={20} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-[28px] bg-slate-950 p-4 text-white shadow-[0_22px_60px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-200">站长严选</p>
              <h2 className="mt-1 text-lg font-semibold">今日爆品橱窗</h2>
            </div>
            <Link href="/mall" className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/85">
              进入商场 <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {station.hotProducts.map((product, index) => (
              <Link
                key={product.id}
                href={product.pddPath}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[158px] flex-shrink-0 overflow-hidden rounded-[22px] bg-white text-slate-950 shadow-xl shadow-slate-950/20 transition-transform active:scale-[0.98]"
              >
                <div className="relative aspect-[1.05] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/300`}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/72 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                    TOP {index + 1}
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-[38px] text-xs font-semibold leading-5 text-slate-800">
                    {product.title}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-base font-bold text-blue-600">¥{product.price.toFixed(2)}</p>
                    <ChevronRight size={15} className="text-slate-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600">本地岗位</p>
            <h2 className="text-lg font-semibold text-slate-950">附近招工</h2>
          </div>
          <Link href="/jobs" className="text-xs font-semibold text-blue-600">查看更多</Link>
        </div>
        <div className="space-y-3">
          {activeJobs.map((job) => (
            <Link
              key={job.title}
              href="/jobs"
              className="flex items-center justify-between gap-4 rounded-[24px] border border-white bg-white px-4 py-4 shadow-[0_16px_42px_rgba(15,47,107,0.09)]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Star size={14} className="fill-amber-300 text-amber-300" />
                  <p className="truncate text-sm font-semibold text-slate-950">{job.title}</p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{job.workLocation}</p>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock3 size={12} />
                  {job.workLocationDetail || "时间面议"}
                </p>
              </div>
              <span className="flex-none rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                {job.salary}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-2 pt-5">
        <div className="rounded-[28px] border border-white bg-white p-4 shadow-[0_18px_48px_rgba(15,47,107,0.1)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">服务进展</p>
              <h2 className="text-lg font-semibold text-slate-950">售后动态</h2>
            </div>
            <Link href="/complaint/history" className="text-xs font-semibold text-blue-600">
              全部记录
            </Link>
          </div>
          <HomeComplaints />
        </div>
      </section>
    </div>
  );
}
