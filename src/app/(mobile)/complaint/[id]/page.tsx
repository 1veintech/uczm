import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import Link from "next/link";

const PROBLEM_TYPE_LABELS: Record<string, string> = {
  MISSING: "缺货",
  DAMAGED: "破损",
  WRONG_ITEM: "错送",
  QUALITY: "质量问题",
  OTHER: "其他",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  PENDING: { label: "待处理", color: "text-orange-500", bgColor: "bg-orange-50", icon: Clock },
  RESOLVED: { label: "已处理", color: "text-green-500", bgColor: "bg-green-50", icon: CheckCircle },
  ESCALATED: { label: "已升级", color: "text-red-500", bgColor: "bg-red-50", icon: AlertTriangle },
};

const RESOLVE_TYPE_LABELS: Record<string, string> = {
  refund: "退款",
  replace: "补货",
  coupon: "优惠券/抵扣",
  other: "其他方式",
};

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      station: { select: { name: true } },
      customer: { select: { nickname: true } },
    },
  });

  if (!complaint) notFound();

  const images: string[] = complaint.images ? JSON.parse(complaint.images) : [];
  const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen mini-page">
      {/* Header */}
      <div className="sticky top-0 z-40 mini-topbar">
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="p-1 -ml-1 active:scale-95 transition-transform">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            售后详情
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Status Card */}
        <div className={`rounded-lg p-5 ${statusConfig.bgColor} `}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm`}>
              <StatusIcon size={24} className={statusConfig.color} />
            </div>
            <div>
              <p className={`text-lg font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {complaint.status === "RESOLVED"
                  ? "站长已处理您的反馈"
                  : complaint.status === "ESCALATED"
                    ? "已升级给区县代理处理"
                    : "等待站长处理"}
              </p>
            </div>
          </div>
        </div>

        {/* Problem Info */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            问题信息
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">问题类型</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                {PROBLEM_TYPE_LABELS[complaint.problemType] || complaint.problemType}
              </span>
            </div>
            {complaint.orderNo && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">关联订单</span>
                <span className="text-sm text-gray-700 font-mono">{complaint.orderNo}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">问题描述</span>
              <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">提交时间</span>
              <span className="text-xs text-gray-500">
                {new Date(complaint.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
          </div>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="mini-card p-4 ">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              图片凭证
            </h3>
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`凭证${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Result - Show when resolved */}
        {(complaint.status === "RESOLVED" || complaint.status === "ESCALATED") && (
          <div className="mini-card p-4 ">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              处理结果
            </h3>
            <div className="space-y-3">
              {complaint.resolveType && (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">处理方式</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                    {RESOLVE_TYPE_LABELS[complaint.resolveType] || complaint.resolveType}
                  </span>
                </div>
              )}
              {complaint.resolveRemark && (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">处理备注</span>
                  <p className="text-sm text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3">
                    {complaint.resolveRemark}
                  </p>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">处理时间</span>
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.resolvedAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              )}
              {!complaint.resolveType && !complaint.resolveRemark && (
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-600 font-medium">该问题已被处理</p>
                  <p className="text-xs text-green-500 mt-0.5">站长已为您解决了此问题</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Station Info */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            处理站点
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{complaint.station?.name || "未知"}</p>
              <p className="text-xs text-gray-400 mt-0.5">负责处理您的售后问题，进度将在站内更新</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
              站内处理
            </span>
          </div>
        </div>

        {/* Contact for follow-up */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <MessageSquare size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-blue-600">如需补充信息或有疑问，请继续通过售后记录查看处理进度</p>
        </div>
      </div>
    </div>
  );
}
