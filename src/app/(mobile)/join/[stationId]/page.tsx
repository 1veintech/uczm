import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ stationId: string }>;
}

export default async function JoinStationPage({ params }: PageProps) {
  const { stationId } = await params;

  const station = await prisma.station.findUnique({
    where: { id: stationId },
    include: {
      user: { select: { name: true, email: true } },
      agent: { select: { name: true, region: true } },
    },
  });

  if (!station || station.status !== "APPROVED") notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-5 pt-16 pb-12">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/[0.08]" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/[0.05]" />
        <div className="absolute top-10 right-16 w-3 h-3 rounded-full bg-white/20" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white shadow-lg mx-auto mb-4">
            {station.name[0]}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">{station.name}</h1>
          <p className="text-blue-100/80 text-sm mt-1 flex items-center justify-center gap-1">
            <MapPin size={14} />
            {station.address}
          </p>
          {station.agent && (
            <p className="text-blue-200/60 text-xs mt-2">
              所属区域：{station.agent.region} · 代理：{station.agent.name}
            </p>
          )}
        </div>
      </div>

      {/* Region Attribution Info */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-50">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">扫码绑定服务站</h2>
            <p className="text-sm text-gray-500 mt-1">
              授权手机号后，您将成为该站点的专属客户
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 bg-blue-50/50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">售后直达站长</p>
                <p className="text-xs text-gray-400 mt-0.5">有问题直接找站长处理，省去平台中间环节</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50/50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">专属区域服务</p>
                <p className="text-xs text-gray-400 mt-0.5">您所在的区域已归属{station.name}，享受本地化服务</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-orange-50/50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-500 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">本地爆品推荐</p>
                <p className="text-xs text-gray-400 mt-0.5">站长精选好物，专属优惠价格</p>
              </div>
            </div>
          </div>

          {/* Station Info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">站点编号</span>
              <span className="text-gray-600 font-mono text-xs">{station.id.slice(0, 12)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">所属区域</span>
              <span className="text-gray-600">{station.agent?.region || "未分配"}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">联系电话</span>
              <a href={`tel:${station.phone}`} className="text-blue-500">{station.phone}</a>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/login"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            授权手机号并绑定
            <ArrowRight size={18} />
          </Link>

          <p className="text-center text-[10px] text-gray-400 mt-3">
            绑定后可在"我的"页面查看归属站点信息
          </p>
        </div>
      </div>

      {/* Region Zone Label */}
      {station.agent && (
        <div className="px-4 mt-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-100">
            <p className="text-xs text-blue-400">您当前所在区域</p>
            <p className="text-base font-bold text-blue-600 mt-1">{station.agent.region}</p>
            <p className="text-[11px] text-blue-400 mt-0.5">区域代理：{station.agent.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
