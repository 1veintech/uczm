import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATION_STATUS_LABELS,
  PLAN_TYPE_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      user: true,
      stations: {
        include: { user: true, orders: true, complaints: true, customers: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) notFound();

  const totalSales = agent.stations.reduce(
    (sum, s) => sum + s.orders.filter((o) => o.status === "COMPLETED").reduce((os, o) => os + o.totalAmount, 0),
    0
  );
  const totalOrders = agent.stations.reduce((sum, s) => sum + s.orders.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/agents">
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-200"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-sm text-zinc-400">代理详情</p>
        </div>
      </div>

      {/* Agent Info */}
      <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-[0.03]" />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-white text-2xl font-bold">{agent.name.charAt(0)}</span>
              </div>
              <div>
                <CardTitle className="text-xl text-white">{agent.name}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{agent.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{agent.region}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(agent.createdAt).toLocaleDateString("zh-CN")}</span>
                </CardDescription>
              </div>
            </div>
            <Badge className={agent.status === "ACTIVE" ? STATUS_COLORS["ACTIVE"] : STATUS_COLORS["SUSPENDED"]}>
              {agent.status === "ACTIVE" ? "活跃" : "已停用"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><span className="text-zinc-500">佣金比例</span><p className="text-lg font-bold text-white mt-1">{(agent.commissionRate * 100).toFixed(0)}%</p></div>
            <div><span className="text-zinc-500">基础定价</span><p className="text-lg font-bold text-white mt-1">¥{agent.basePrice.toFixed(2)}</p></div>
            <div><span className="text-zinc-500">邮箱</span><p className="text-sm text-zinc-300 mt-1.5">{agent.user.email}</p></div>
            <div><span className="text-zinc-500">用户状态</span><div className="mt-1.5"><Badge variant="outline" className={agent.user.status === "ACTIVE" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}>{agent.user.status === "ACTIVE" ? "正常" : "已禁用"}</Badge></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-blue-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{agent.stations.length}</p><p className="text-xs text-zinc-400">管辖站长</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><ShoppingBag className="h-6 w-6 text-purple-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{totalOrders}</p><p className="text-xs text-zinc-400">总订单</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">¥{(totalSales / 10000).toFixed(1)}万</p><p className="text-xs text-zinc-400">总销售额</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><TrendingUp className="h-6 w-6 text-[#FF6B35] mx-auto mb-2" /><p className="text-2xl font-bold text-white">¥{((totalSales * agent.commissionRate) / 10000).toFixed(1)}万</p><p className="text-xs text-zinc-400">总佣金</p></CardContent></Card>
      </div>

      {/* Station List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5 text-[#FF6B35]" />下辖站长</CardTitle>
          <CardDescription>{agent.stations.length} 个站点</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">站长名称</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">手机号</TableHead>
                <TableHead className="text-zinc-400">版本</TableHead>
                <TableHead className="text-zinc-400 text-center">客户数</TableHead>
                <TableHead className="text-zinc-400 text-center">订单数</TableHead>
                <TableHead className="text-zinc-400 text-center">客诉数</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agent.stations.map((station) => (
                <TableRow key={station.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                        <span className="text-white text-xs font-medium">{station.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-zinc-200">{station.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300 hidden md:table-cell">{station.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={station.planType === "ADVANCED" ? "border-[#FF6B35]/30 text-[#FF6B35]" : "border-zinc-600 text-zinc-400"}>
                      {PLAN_TYPE_LABELS[station.planType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-zinc-200">{station.customers.length}</TableCell>
                  <TableCell className="text-center text-zinc-200">{station.orders.length}</TableCell>
                  <TableCell className="text-center text-zinc-200">{station.complaints.length}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[station.status]}>{STATION_STATUS_LABELS[station.status]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {agent.stations.length === 0 && <div className="py-12 text-center text-zinc-500">该代理暂无下辖站长</div>}
        </CardContent>
      </Card>
    </div>
  );
}
