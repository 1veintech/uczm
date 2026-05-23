"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Clock,
  ShieldAlert,
  Banknote,
  QrCode,
  ShoppingBag,
  Package,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  COMPLAINT_STATUS_LABELS,
  PROBLEM_TYPE_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface DashboardClientProps {
  stationName: string;
  userName: string;
  region: string;
  agentName: string;
  stats: {
    totalComplaints: number;
    pendingComplaints: number;
    escalatedComplaints: number;
    savedFines: number;
    todayOrders: number;
    monthOrders: number;
  };
  recentComplaints: {
    id: string;
    problemType: string;
    description: string;
    status: string;
    customerPhone: string;
    createdAt: string;
  }[];
  revenueData: { date: string; amount: number }[];
}

export default function DashboardClient({
  stationName,
  userName,
  region,
  agentName,
  stats,
  recentComplaints,
  revenueData,
}: DashboardClientProps) {
  const today = format(new Date(), "yyyy年MM月dd日 EEEE", { locale: zhCN });

  const statCards = [
    {
      title: "今日客诉",
      value: stats.totalComplaints,
      icon: MessageSquareWarning,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      change: null,
    },
    {
      title: "待处理",
      value: stats.pendingComplaints,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      change: null,
    },
    {
      title: "本月拦截",
      value: stats.escalatedComplaints,
      icon: ShieldAlert,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      change: null,
    },
    {
      title: "节省罚款",
      value: `¥${stats.savedFines}`,
      icon: Banknote,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      change: null,
    },
  ];

  const quickActions = [
    { title: "生成二维码", href: "/station/qr-code", icon: QrCode, bg: "bg-blue-50", color: "text-blue-500" },
    { title: "查看订单", href: "/station/mall/orders", icon: Package, bg: "bg-emerald-50", color: "text-emerald-500" },
    { title: "管理商品", href: "/station/mall/products", icon: ShoppingBag, bg: "bg-amber-50", color: "text-amber-500" },
    { title: "发布招聘", href: "/station/recruitment", icon: Megaphone, bg: "bg-purple-50", color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#07111F,#12325F_58%,#0E7490)] p-6 shadow-xl shadow-blue-950/15 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute right-4 top-4 rounded-lg border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <p className="text-[10px] text-white/60">所属区域</p>
          <p className="text-sm font-bold text-white">{region}</p>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">
            您好，{userName}站长
          </h1>
          <p className="mt-1 text-sm text-blue-100">{today}</p>
          <p className="mt-2 text-sm text-blue-100/80">
            欢迎回到{stationName}管理后台，今天也要加油哦！
          </p>
        </div>
        <div className="absolute bottom-0 right-12 w-40 h-40 opacity-5">
          <TrendingUp className="w-full h-full text-white" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="border-slate-200 bg-white/[0.92] shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-xl ${card.iconBg} p-3`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="border-slate-200 bg-white/[0.92] shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base font-semibold">
              近7日收入趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v: number) => `¥${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      color: "#1F2937",
                    }}
                    formatter={(value: any) => [`¥${Number(value).toFixed(2)}`, "收入"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-slate-200 bg-white/[0.92] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base font-semibold">
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className="flex cursor-pointer flex-col items-center gap-2.5 rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                    <div className={`rounded-xl ${action.bg} p-2.5`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{action.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent complaints */}
      <Card className="border-slate-200 bg-white/[0.92] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-gray-900 text-base font-semibold">最近客诉</CardTitle>
          <Link href="/station/complaints">
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
              查看全部
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquareWarning className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">暂无客诉记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentComplaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/station/complaints/${complaint.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <MessageSquareWarning className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {PROBLEM_TYPE_LABELS[complaint.problemType] ?? complaint.problemType}
                        </span>
                        <Badge
                          className={`text-xs ${STATUS_COLORS[complaint.status] ?? ""}`}
                          variant="outline"
                        >
                          {COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {complaint.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(complaint.createdAt), "MM-dd HH:mm")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
