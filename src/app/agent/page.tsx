import { prisma } from "@/lib/prisma";
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COMPLAINT_STATUS_LABELS,
  STATION_STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const agent = await prisma.agent.findFirst({
    where: { user: { email: "agent@ddcm.com" } },
    include: {
      stations: {
        include: {
          user: true,
          complaints: true,
          orders: true,
        },
      },
    },
  });

  const stationCount = agent?.stations.length ?? 0;
  const agentRegion = agent?.region ?? "未设置";
  const allComplaints = agent?.stations.flatMap((s) => s.complaints) ?? [];
  const totalComplaints = allComplaints.length;
  const resolvedCount = allComplaints.filter((c) => c.status === "RESOLVED").length;
  const interceptRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(1) : "0.0";
  const totalOrders = agent?.stations.reduce((sum, s) => sum + s.orders.length, 0) ?? 0;

  const recentComplaints = allComplaints
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="premium-dark-panel relative overflow-hidden rounded-lg p-6 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,184,166,0.24),transparent_42%),linear-gradient(35deg,transparent_55%,rgba(37,99,235,0.24))]" />
        <div className="absolute right-4 top-4 rounded-lg border border-white/15 bg-white/[0.12] px-4 py-2 backdrop-blur-sm">
          <p className="text-[10px] text-white/60">授权区域</p>
          <p className="text-sm font-bold text-white">{agentRegion}</p>
        </div>
        <div className="relative">
          <h1 className="text-2xl font-bold">欢迎回来，{agent?.name || "代理"}</h1>
          <p className="text-blue-100 mt-1 text-sm">辖区：{agentRegion} · {stationCount}个站点 · 管理好您的辖区</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">辖区站长数</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stationCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总客诉数</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{totalComplaints}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">拦截率</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{interceptRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总商城订单</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Summary & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Per-Station Summary */}
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 text-base">站长概况</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-500 text-xs">查看全部</Button>
            </div>
            <CardDescription>各站点核心数据一览</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {agent?.stations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                      <span className="text-white text-xs font-medium">
                        {station.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{station.name}</p>
                      <p className="text-xs text-slate-400">{station.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-slate-400">客诉</p>
                      <p className="font-medium text-slate-700">{station.complaints.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">订单</p>
                      <p className="font-medium text-slate-700">{station.orders.length}</p>
                    </div>
                    <Badge className={STATUS_COLORS[station.status] ?? ""}>
                      {STATION_STATUS_LABELS[station.status] ?? station.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!agent?.stations || agent.stations.length === 0) && (
                <p className="text-center text-slate-400 py-8 text-sm">暂无站长数据</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-white/[0.08] bg-white/[0.92] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 text-base">最近动态</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-500 text-xs">查看全部</Button>
            </div>
            <CardDescription>最近处理的客诉工单</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {recentComplaints.map((complaint) => {
                const station = agent?.stations.find((s) => s.id === complaint.stationId);
                return (
                  <div
                    key={complaint.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                        complaint.status === "RESOLVED"
                          ? "bg-green-100"
                          : complaint.status === "ESCALATED"
                            ? "bg-red-100"
                            : "bg-amber-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          complaint.status === "RESOLVED"
                            ? "text-green-500"
                            : complaint.status === "ESCALATED"
                              ? "text-red-500"
                              : "text-amber-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {station?.name ?? "未知站点"}
                        </p>
                        <Badge className={STATUS_COLORS[complaint.status]}>
                          {COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{complaint.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(complaint.createdAt).toLocaleString("zh-CN")}</p>
                    </div>
                  </div>
                );
              })}
              {recentComplaints.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">暂无最近动态</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
