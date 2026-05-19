"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  WITHDRAWAL_STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";
import { format } from "date-fns";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface IncomeClientProps {
  stats: {
    todayOrders: number;
    monthOrders: number;
    todayAmount: number;
    monthAmount: number;
    availableBalance: number;
    totalWithdrawn: number;
  };
  revenueData: { date: string; amount: number }[];
  withdrawals: Withdrawal[];
}

export default function IncomeClient({
  stats,
  revenueData,
  withdrawals,
}: IncomeClientProps) {
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("请输入有效的提现金额");
      return;
    }
    if (amount > stats.availableBalance) {
      toast.error("提现金额不能大于可提现余额");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        toast.success("提现申请已提交");
        setShowWithdrawDialog(false);
        setWithdrawAmount("");
        window.location.reload();
      } else {
        toast.error("提现申请失败");
      }
    } catch {
      toast.error("提现申请失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statCards = [
    {
      title: "今日订单",
      value: stats.todayOrders,
      icon: ShoppingBag,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "本月订单",
      value: stats.monthOrders,
      icon: ShoppingBag,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      title: "今日成交额",
      value: `¥${stats.todayAmount.toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "本月成交额",
      value: `¥${stats.monthAmount.toFixed(2)}`,
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">收入统计</h1>
        <p className="text-sm text-gray-500 mt-1">查看收入数据，申请提现</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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
        <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base font-semibold">近30日收入趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
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
                    formatter={(value: any) => [`¥${value.toFixed(2)}`, "收入"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorIncome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal section */}
        <div className="space-y-6">
          {/* Balance card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-500" />
                账户余额
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                <p className="text-sm text-gray-500">可提现余额</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ¥{stats.availableBalance.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-400">已提现</p>
                  <p className="text-sm font-medium text-emerald-600 mt-0.5">
                    ¥{stats.totalWithdrawn.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-400">本月收入</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    ¥{stats.monthAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={stats.availableBalance <= 0}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                申请提现
              </Button>
            </CardContent>
          </Card>

          {/* Withdrawal history */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold">提现记录</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Clock className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-sm">暂无提现记录</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            w.status === "COMPLETED"
                              ? "bg-emerald-50"
                              : w.status === "APPROVED"
                              ? "bg-blue-50"
                              : w.status === "REJECTED"
                              ? "bg-red-50"
                              : "bg-amber-50"
                          }`}
                        >
                          {w.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : w.status === "REJECTED" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ¥{w.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(w.createdAt), "MM-dd HH:mm")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[w.status] ?? ""}`}
                        variant="outline"
                      >
                        {WITHDRAWAL_STATUS_LABELS[w.status] ?? w.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdraw dialog */}
      <Dialog
        open={showWithdrawDialog}
        onOpenChange={(open) => {
          setShowWithdrawDialog(open);
          if (!open) setWithdrawAmount("");
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">申请提现</DialogTitle>
            <DialogDescription className="text-gray-500">
              可提现余额: ¥{stats.availableBalance.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">提现金额</p>
              <Input
                type="number"
                step="0.01"
                placeholder="输入提现金额"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-lg"
              />
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => setWithdrawAmount(String(amount))}
                >
                  ¥{amount}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                onClick={() => setWithdrawAmount(String(stats.availableBalance.toFixed(2)))}
              >
                全部
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowWithdrawDialog(false);
                setWithdrawAmount("");
              }}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              onClick={handleWithdraw}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "确认提现"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
