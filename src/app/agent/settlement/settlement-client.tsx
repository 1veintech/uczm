"use client";

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WITHDRAWAL_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

interface SaleData {
  id: string;
  stationName: string;
  orderNo: string;
  amount: number;
  commission: number;
  date: string;
}

interface WithdrawalData {
  id: string;
  amount: number;
  status: string;
  bankInfo: string;
  createdAt: string;
}

export function AgentSettlementClient({
  sales,
  withdrawals,
}: {
  sales: SaleData[];
  withdrawals: WithdrawalData[];
}) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState("");

  const totalCommission = sales.reduce((sum, s) => sum + s.commission, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const withdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED" || w.status === "APPROVED")
    .reduce((sum, w) => sum + w.amount, 0);
  const balance = totalCommission - withdrawn;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">收入结算</h1>
          <p className="text-sm text-zinc-400 mt-1">查看销售佣金与提现记录</p>
        </div>
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0">
              <CreditCard className="mr-2 h-4 w-4" />申请提现
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">申请提现</DialogTitle>
              <DialogDescription>可提现余额: ¥{balance.toFixed(2)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">提现金额</Label>
                <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="请输入提现金额" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">收款银行信息</Label>
                <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="银行名称 + 卡号后四位" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">取消</Button>
              <Button
                className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                onClick={() => setWithdrawOpen(false)}
              >
                确认提现
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] opacity-[0.05]" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">可提现余额</p>
                <p className="text-3xl font-bold text-white mt-1">¥{balance.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                <Wallet className="h-6 w-6 text-[#FF6B35]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">总销售额</p>
                <p className="text-3xl font-bold text-white mt-1">¥{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">总佣金</p>
                <p className="text-3xl font-bold text-white mt-1">¥{totalCommission.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <ArrowUpRight className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">已提现</p>
                <p className="text-3xl font-bold text-white mt-1">¥{withdrawn.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <ArrowDownLeft className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Records */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#FF6B35]" />销售记录</CardTitle>
              <CardDescription>各站点销售与佣金明细</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Download className="mr-2 h-4 w-4" />导出</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">日期</TableHead>
                <TableHead className="text-zinc-400">站点</TableHead>
                <TableHead className="text-zinc-400">订单号</TableHead>
                <TableHead className="text-zinc-400 text-right">销售额</TableHead>
                <TableHead className="text-zinc-400 text-right">佣金</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{sale.date}</TableCell>
                  <TableCell className="text-zinc-200 font-medium">{sale.stationName}</TableCell>
                  <TableCell className="text-zinc-400 font-mono text-xs">{sale.orderNo}</TableCell>
                  <TableCell className="text-right text-zinc-200">¥{sale.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-400 font-medium">+¥{sale.commission.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sales.length === 0 && <div className="py-8 text-center text-zinc-500">暂无销售记录</div>}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><CreditCard className="h-5 w-5 text-[#FF6B35]" />提现记录</CardTitle>
          <CardDescription>历史提现申请与状态</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">申请时间</TableHead>
                <TableHead className="text-zinc-400">金额</TableHead>
                <TableHead className="text-zinc-400">银行信息</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{w.createdAt}</TableCell>
                  <TableCell className="text-zinc-200 font-medium">¥{w.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-zinc-400">{w.bankInfo}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[w.status]}>{WITHDRAWAL_STATUS_LABELS[w.status]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {withdrawals.length === 0 && <div className="py-8 text-center text-zinc-500">暂无提现记录</div>}
        </CardContent>
      </Card>
    </div>
  );
}
