import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShoppingBag,
  AlertTriangle,
  Users,
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
  COMPLAINT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PROBLEM_TYPE_LABELS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const station = await prisma.station.findUnique({
    where: { id },
    include: {
      user: true,
      complaints: { orderBy: { createdAt: "desc" }, take: 10 },
      orders: { orderBy: { createdAt: "desc" }, take: 10, include: { items: true } },
      customers: true,
      products: true,
    },
  });

  if (!station) notFound();

  const complaintStats = {
    total: station.complaints.length,
    pending: station.complaints.filter((c) => c.status === "PENDING").length,
    resolved: station.complaints.filter((c) => c.status === "RESOLVED").length,
    escalated: station.complaints.filter((c) => c.status === "ESCALATED").length,
  };

  const orderStats = {
    total: station.orders.length,
    revenue: station.orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agent/stations">
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{station.name}</h1>
          <p className="text-sm text-zinc-400">站长详情</p>
        </div>
      </div>

      {/* Station Info Card */}
      <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] opacity-[0.03]" />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                <span className="text-white text-2xl font-bold">{station.name.charAt(0)}</span>
              </div>
              <div>
                <CardTitle className="text-xl text-white">{station.name}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{station.phone}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(station.createdAt).toLocaleDateString("zh-CN")}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={station.planType === "ADVANCED" ? "border-[#FF6B35]/30 text-[#FF6B35]" : "border-zinc-600 text-zinc-400"}>
                <Shield className="mr-1 h-3 w-3" />{PLAN_TYPE_LABELS[station.planType]}
              </Badge>
              <Badge className={STATUS_COLORS[station.status]}>
                {STATION_STATUS_LABELS[station.status]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />{station.address}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{station.customers.length}</p>
            <p className="text-xs text-zinc-400">客户数</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{orderStats.total}</p>
            <p className="text-xs text-zinc-400">总订单</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{complaintStats.total}</p>
            <p className="text-xs text-zinc-400">客诉数</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{station.products.length}</p>
            <p className="text-xs text-zinc-400">商品数</p>
          </CardContent>
        </Card>
      </div>

      {/* Complaints & Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FF6B35]" />客诉记录
            </CardTitle>
            <CardDescription>
              待处理 {complaintStats.pending} | 已处理 {complaintStats.resolved} | 已升级 {complaintStats.escalated}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">类型</TableHead>
                  <TableHead className="text-zinc-400">描述</TableHead>
                  <TableHead className="text-zinc-400">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {station.complaints.slice(0, 5).map((complaint) => (
                  <TableRow key={complaint.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-300">{PROBLEM_TYPE_LABELS[complaint.problemType]}</TableCell>
                    <TableCell className="text-zinc-400 max-w-[150px] truncate">{complaint.description}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[complaint.status]}>
                        {COMPLAINT_STATUS_LABELS[complaint.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {station.complaints.length === 0 && <p className="text-center text-zinc-500 py-6">暂无客诉记录</p>}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#FF6B35]" />订单记录
            </CardTitle>
            <CardDescription>已完成订单收入: ¥{orderStats.revenue.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">订单号</TableHead>
                  <TableHead className="text-zinc-400">金额</TableHead>
                  <TableHead className="text-zinc-400">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {station.orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-300 font-mono text-xs">{order.orderNo}</TableCell>
                    <TableCell className="text-zinc-200 font-medium">¥{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {station.orders.length === 0 && <p className="text-center text-zinc-500 py-6">暂无订单记录</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
