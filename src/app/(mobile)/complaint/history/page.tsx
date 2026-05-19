import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

const PROBLEM_TYPE_LABELS: Record<string, string> = {
  MISSING: "缺货",
  DAMAGED: "破损",
  WRONG_ITEM: "错送",
  QUALITY: "质量问题",
  OTHER: "其他",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  PENDING: { label: "待处理", color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-100" },
  RESOLVED: { label: "已处理", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-100" },
  ESCALATED: { label: "已升级", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-100" },
};

export default async function ComplaintHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const customer = await prisma.customer.findFirst();

  if (!customer) notFound();

  const complaints = await prisma.complaint.findMany({
    where: {
      customerId: customer.id,
      ...(statusFilter === "PENDING" ? { status: "PENDING" } :
         statusFilter === "RESOLVED" ? { status: { in: ["RESOLVED", "ESCALATED"] } } : {}),
    },
    include: {
      station: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all counts for the stats (unfiltered)
  const allComplaints = await prisma.complaint.findMany({
    where: { customerId: customer.id },
    select: { status: true },
  });
  const pendingCount = allComplaints.filter(c => c.status === "PENDING").length;
  const resolvedCount = allComplaints.filter(c => c.status === "RESOLVED" || c.status === "ESCALATED").length;
  const totalCount = allComplaints.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/profile" className="p-1 -ml-1 active:scale-95 transition-transform">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            售后记录
          </h1>
        </div>
      </div>

      {/* Stats - clickable to filter */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2">
          <Link
            href={statusFilter === "PENDING" ? "/complaint/history" : "/complaint/history?status=PENDING"}
            className={`flex-1 rounded-2xl p-3 text-center active:scale-95 transition-all border ${
              statusFilter === "PENDING"
                ? "bg-orange-100 border-orange-300 shadow-sm"
                : "bg-orange-50 border-orange-100"
            }`}
          >
            <p className="text-xl font-bold text-orange-500">{pendingCount}</p>
            <p className="text-[10px] text-orange-400 mt-0.5">待处理</p>
          </Link>
          <Link
            href={statusFilter === "RESOLVED" ? "/complaint/history" : "/complaint/history?status=RESOLVED"}
            className={`flex-1 rounded-2xl p-3 text-center active:scale-95 transition-all border ${
              statusFilter === "RESOLVED"
                ? "bg-green-100 border-green-300 shadow-sm"
                : "bg-green-50 border-green-100"
            }`}
          >
            <p className="text-xl font-bold text-green-500">{resolvedCount}</p>
            <p className="text-[10px] text-green-400 mt-0.5">已处理</p>
          </Link>
          <Link
            href="/complaint/history"
            className={`flex-1 rounded-2xl p-3 text-center active:scale-95 transition-all border ${
              !statusFilter
                ? "bg-blue-100 border-blue-300 shadow-sm"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <p className="text-xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-[10px] text-blue-400 mt-0.5">总计</p>
          </Link>
        </div>
      </div>

      {/* Complaint List */}
      <div className="px-4 py-3 space-y-2">
        {complaints.length > 0 ? (
          complaints.map((complaint) => {
            const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING;
            return (
              <Link
                key={complaint.id}
                href={`/complaint/${complaint.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-gray-50 active:scale-[0.98] transition-transform overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.bgColor}`}>
                      {complaint.status === "RESOLVED" ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : complaint.status === "ESCALATED" ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : (
                        <Clock size={16} className="text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(complaint.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                          {PROBLEM_TYPE_LABELS[complaint.problemType] || complaint.problemType}
                        </span>
                        {complaint.station?.name && (
                          <span className="text-[10px] text-gray-400">{complaint.station.name}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 mt-1 flex-shrink-0" />
                  </div>

                  {/* Resolution Preview */}
                  {(complaint.status === "RESOLVED" || complaint.status === "ESCALATED") && complaint.resolveRemark && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-[11px] text-green-600 font-medium">处理结果:</span>
                        <span className="text-[11px] text-gray-600 line-clamp-1">{complaint.resolveRemark}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-50">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">暂无售后记录</p>
            <p className="text-xs text-gray-400 mt-1">一切正常，没有售后问题</p>
            <Link
              href="/complaint"
              className="inline-block mt-4 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
            >
              提交反馈
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
