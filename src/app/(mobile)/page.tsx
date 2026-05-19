import { prisma } from "@/lib/prisma";
import { Phone, MapPin, AlertTriangle, Briefcase, Package, User, ChevronRight, Clock, CheckCircle, ArrowRight, History } from "lucide-react";
import Link from "next/link";

const quickActions = [
  { icon: AlertTriangle, label: "售后报损", href: "/complaint", color: "from-orange-400 to-red-500", desc: "缺货/破损？点这里" },
  { icon: Briefcase, label: "招聘信息", href: "/jobs", color: "from-blue-400 to-blue-600", desc: "找兼职/全职" },
  { icon: Package, label: "我的订单", href: "/orders", color: "from-emerald-400 to-emerald-600", desc: "查看订单状态" },
  { icon: User, label: "个人中心", href: "/profile", color: "from-purple-400 to-purple-600", desc: "管理个人信息" },
];

export default async function HomePage() {
  const station = await prisma.station.findFirst({
    where: { status: "APPROVED" },
    include: {
      hotProducts: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" }, take: 6 },
      jobs: { where: { status: "HIRING" }, take: 2 },
      complaints: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: true },
      },
    },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-400 text-sm">暂无可用站点</p>
      </div>
    );
  }

  // Count complaints by status
  const pendingCount = station.complaints.filter(c => c.status === "PENDING").length;
  const resolvedCount = station.complaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="pb-6 bg-slate-50 min-h-screen">
      {/* Station Header - Premium Design */}
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-5 pt-14 pb-10 shadow-xl shadow-blue-600/20">
        {/* Decorative Elements */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.08]" />
        <div className="absolute top-24 -left-12 w-36 h-36 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-10 right-8 w-24 h-24 rounded-full bg-white/[0.06]" />
        <div className="absolute top-6 right-20 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute top-16 right-32 w-2 h-2 rounded-full bg-white/15" />
        <div className="absolute bottom-16 left-16 w-2 h-2 rounded-full bg-white/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {station.name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white tracking-wide">{station.name}</h1>
              <p className="text-blue-100/80 text-xs mt-1 flex items-center gap-1">
                <MapPin size={12} />
                {station.address}
              </p>
            </div>
          </div>
          <a
            href={`tel:${station.phone}`}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 text-sm font-medium text-white hover:bg-white/30 transition-all active:scale-95 shadow-lg shadow-blue-900/10"
          >
            <Phone size={14} />
            联系站长
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 p-4 grid grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform py-1"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-[11px] text-gray-700 font-semibold">{action.label}</span>
                <span className="text-[9px] text-gray-400">{action.desc}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* After-Sales / Complaint Section - TOP PRIORITY */}
      <section className="mt-5 px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800">售后动态</h2>
              </div>
              <Link href="/complaint" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                我要反馈 <ChevronRight size={14} />
              </Link>
            </div>

            {/* Stats Row - clickable */}
            <div className="flex gap-2 mt-3">
              <Link href="/complaint/history?status=PENDING" className="flex-1 bg-orange-50 rounded-xl p-2.5 text-center active:scale-95 transition-transform">
                <p className="text-lg font-bold text-orange-500">{pendingCount}</p>
                <p className="text-[10px] text-orange-400">待处理</p>
              </Link>
              <Link href="/complaint/history?status=RESOLVED" className="flex-1 bg-green-50 rounded-xl p-2.5 text-center active:scale-95 transition-transform">
                <p className="text-lg font-bold text-green-500">{resolvedCount}</p>
                <p className="text-[10px] text-green-400">已处理</p>
              </Link>
              <Link href="/complaint/history" className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center active:scale-95 transition-transform">
                <p className="text-lg font-bold text-blue-500">{station.complaints.length}</p>
                <p className="text-[10px] text-blue-400">总计</p>
              </Link>
            </div>
          </div>

          {/* Complaint List */}
          {station.complaints.length > 0 ? (
            <div className="border-t border-gray-50">
              {station.complaints.slice(0, 3).map((complaint, idx) => (
                <Link key={complaint.id} href={`/complaint/${complaint.id}`} className={`flex items-start gap-3 px-4 py-3 active:bg-gray-50 transition-colors ${idx < 2 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    complaint.status === "RESOLVED" ? "bg-green-100" :
                    complaint.status === "ESCALATED" ? "bg-red-100" : "bg-orange-100"
                  }`}>
                    {complaint.status === "RESOLVED" ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : complaint.status === "ESCALATED" ? (
                      <AlertTriangle size={14} className="text-red-500" />
                    ) : (
                      <Clock size={14} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">
                        {complaint.customer?.nickname || "客户"}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        complaint.status === "RESOLVED" ? "bg-green-100 text-green-600" :
                        complaint.status === "ESCALATED" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                      }`}>
                        {complaint.status === "RESOLVED" ? "已处理" :
                         complaint.status === "ESCALATED" ? "已升级" : "待处理"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{complaint.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(complaint.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 mt-1 flex-shrink-0" />
                </Link>
              ))}
              {station.complaints.length > 3 && (
                <Link href="/complaint/history" className="flex items-center justify-center gap-1 py-2.5 text-xs text-blue-500 font-medium border-t border-gray-50 active:bg-gray-50 transition-colors">
                  查看全部售后记录 <ChevronRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div className="border-t border-gray-50 px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <p className="text-xs text-gray-400">暂无售后记录，一切正常！</p>
            </div>
          )}
        </div>
      </section>

      {/* Hot Products Section */}
      {station.hotProducts.length > 0 && (
        <section className="mt-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              精选好物
            </h2>
            <Link href="/mall" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
              去商城逛逛 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {station.hotProducts.map((product) => (
              <Link
                key={product.id}
                href={`/mall/${product.id}`}
                className="flex-shrink-0 w-[140px] active:scale-[0.97] transition-transform"
              >
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50 hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200/200`}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug h-9">{product.title}</p>
                    <p className="text-base font-bold text-blue-600 mt-2">
                      <span className="text-[11px]">¥</span>{product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Jobs */}
      {station.jobs.length > 0 && (
        <section className="mt-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              最新招聘
            </h2>
            <Link href="/jobs" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
              查看更多 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {station.jobs.map((job) => (
              <Link key={job.id} href="/jobs" className="bg-white rounded-2xl shadow-sm p-4 active:scale-[0.98] transition-transform border border-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{job.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={11} className="text-blue-400" />
                      {job.workLocation}
                    </p>
                  </div>
                  <span className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[11px] font-bold shadow-sm shadow-blue-500/20">
                    {job.salary}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
