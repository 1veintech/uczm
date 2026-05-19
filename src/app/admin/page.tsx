import { prisma } from "@/lib/prisma";
import {
  UserCheck,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShoppingCart,
  Flame,
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
  STATUS_COLORS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [agentCount, stationCount, allComplaints, allOrders, pendingWithdrawals, hotProductCount, agents] =
    await Promise.all([
      prisma.agent.count(),
      prisma.station.count(),
      prisma.complaint.findMany({
        include: { station: { include: { agent: { select: { name: true, region: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.order.findMany({ where: { status: "COMPLETED" } }),
      prisma.withdrawalRequest.findMany({
        where: { status: "PENDING" },
        include: { station: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hotProduct.count(),
      prisma.agent.findMany({
        include: { _count: { select: { stations: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeComplaints = allComplaints.filter((c) => c.status !== "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold">欢迎回来，管理员</h1>
          <p className="text-blue-100 mt-1 text-sm">今天是{new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}，祝您工作顺利！</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">待处理提现</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{pendingWithdrawals.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">活跃客诉</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{activeComplaints}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">月平台收入</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">¥{(totalRevenue / 10000).toFixed(1)}万</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">总代理数</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{agentCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <UserCheck className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">总站长数</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stationCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">爆品总数</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{hotProductCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Region Overview */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 text-base">区域概览</CardTitle>
          <CardDescription>各区县代理及管辖站点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-white text-sm font-bold">{a.region[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{a.region}</p>
                  <p className="text-xs text-slate-400">{a.name} · {a._count.stations}个站点</p>
                </div>
                <Badge className={a.status === "ACTIVE" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}>
                  {a.status === "ACTIVE" ? "正常" : "暂停"}
                </Badge>
              </div>
            ))}
            {agents.length === 0 && <p className="text-center text-slate-400 py-6 text-sm col-span-full">暂无代理数据</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart - Simple bar chart */}
        <Card className="bg-white border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800 text-base">收入趋势</CardTitle>
                <CardDescription>近6个月平台总收入</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs">近7天</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40 mt-4">
              {[
                { month: "1月", value: 45000 },
                { month: "2月", value: 52000 },
                { month: "3月", value: 61000 },
                { month: "4月", value: 58000 },
                { month: "5月", value: 72000 },
                { month: "6月", value: 68000 },
              ].map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400">¥{(item.value / 1000).toFixed(0)}k</span>
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500" style={{ height: `${(item.value / 72000) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 text-base flex items-center gap-2">
                待处理提现
                {pendingWithdrawals.length > 0 && (
                  <Badge className="bg-red-100 text-red-600 border-0 text-xs">{pendingWithdrawals.length}</Badge>
                )}
              </CardTitle>
            </div>
            <CardDescription>需要审核的提现申请</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {pendingWithdrawals.slice(0, 4).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{w.station?.name || "未知"}</p>
                    <p className="text-xs text-slate-400">{new Date(w.createdAt).toLocaleDateString("zh-CN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">¥{w.amount.toFixed(2)}</p>
                    <Badge className="mt-1 bg-amber-100 text-amber-600 border-0 text-[10px]">待审核</Badge>
                  </div>
                </div>
              ))}
              {pendingWithdrawals.length === 0 && <p className="text-center text-slate-400 py-6 text-sm">暂无待处理提现</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 text-base">最新客诉</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-500 text-xs">查看更多</Button>
          </div>
          <CardDescription>平台最近的客诉动态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allComplaints.slice(0, 6).map((complaint) => (
              <div key={complaint.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${complaint.status === "RESOLVED" ? "bg-green-100" : complaint.status === "ESCALATED" ? "bg-red-100" : "bg-amber-100"}`}>
                  <AlertTriangle className={`h-4 w-4 ${complaint.status === "RESOLVED" ? "text-green-500" : complaint.status === "ESCALATED" ? "text-red-500" : "text-amber-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700">{complaint.station?.name || "未知"}</p>
                    <Badge className={STATUS_COLORS[complaint.status]}>{COMPLAINT_STATUS_LABELS[complaint.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400 truncate flex-1">{complaint.description}</p>
                    {complaint.station?.agent?.region && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 shrink-0">{complaint.station.agent.region}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{new Date(complaint.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            ))}
            {allComplaints.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暂无最近动态</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
