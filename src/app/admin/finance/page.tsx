"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  CreditCard,
  Download,
  Eye,
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
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { WITHDRAWAL_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

const MOCK_WITHDRAWALS = [
  { id: "w1", stationName: "阳光社区站", agentName: "张三", amount: 500, status: "PENDING", bankInfo: "工商银行 ****6789", createdAt: "2024-03-15" },
  { id: "w2", stationName: "翠苑小区站", agentName: "张三", amount: 300, status: "PENDING", bankInfo: "建设银行 ****1234", createdAt: "2024-03-14" },
  { id: "w3", stationName: "文新街道站", agentName: "李四", amount: 800, status: "APPROVED", bankInfo: "农业银行 ****5678", createdAt: "2024-03-13" },
  { id: "w4", stationName: "转塘镇站", agentName: "李四", amount: 200, status: "COMPLETED", bankInfo: "工商银行 ****9012", createdAt: "2024-03-10" },
  { id: "w5", stationName: "三墩镇站", agentName: "张三", amount: 150, status: "REJECTED", bankInfo: "招商银行 ****3456", createdAt: "2024-03-08", remark: "账户信息不符" },
  { id: "w6", stationName: "良渚街道站", agentName: "赵六", amount: 650, status: "COMPLETED", bankInfo: "中国银行 ****7890", createdAt: "2024-03-05" },
];

const MOCK_REVENUE = [
  { month: "2024-01", orders: 1250, revenue: 89600, commission: 8960 },
  { month: "2024-02", orders: 1380, revenue: 102400, commission: 10240 },
  { month: "2024-03", orders: 1520, revenue: 118700, commission: 11870 },
];

export default function AdminFinancePage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<(typeof MOCK_WITHDRAWALS)[0] | null>(null);
  const [reviewRemark, setReviewRemark] = useState("");

  const pendingWithdrawals = MOCK_WITHDRAWALS.filter((w) => w.status === "PENDING");
  const totalWithdrawn = MOCK_WITHDRAWALS.filter((w) => w.status === "COMPLETED" || w.status === "APPROVED").reduce((sum, w) => sum + w.amount, 0);
  const totalRevenue = MOCK_REVENUE.reduce((sum, r) => sum + r.revenue, 0);
  const totalCommission = MOCK_REVENUE.reduce((sum, r) => sum + r.commission, 0);
  const maxRevenue = Math.max(...MOCK_REVENUE.map((r) => r.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">财务管理</h1>
          <p className="text-sm text-zinc-400 mt-1">平台收入、提现审核与财务报表</p>
        </div>
        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Download className="mr-2 h-4 w-4" />导出报表</Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-[0.05]" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">总收入</p><p className="text-3xl font-bold text-white mt-1">¥{(totalRevenue / 10000).toFixed(1)}万</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10"><TrendingUp className="h-6 w-6 text-green-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">总佣金</p><p className="text-3xl font-bold text-white mt-1">¥{(totalCommission / 10000).toFixed(1)}万</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10"><DollarSign className="h-6 w-6 text-blue-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">待审核提现</p><p className="text-3xl font-bold text-yellow-400 mt-1">{pendingWithdrawals.length}</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10"><CreditCard className="h-6 w-6 text-yellow-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">已提现总额</p><p className="text-3xl font-bold text-white mt-1">¥{totalWithdrawn.toLocaleString()}</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10"><ArrowDownLeft className="h-6 w-6 text-purple-400" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#FF6B35]" />月度收入趋势</CardTitle>
          <CardDescription>近3个月平台收入与佣金</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6 h-48">
            {MOCK_REVENUE.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex gap-1 items-end" style={{ height: "140px" }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-zinc-400">¥{(item.revenue / 10000).toFixed(1)}万</span>
                    <div className="w-8 rounded-t-md bg-gradient-to-t from-[#FF6B35] to-[#FF8F65]" style={{ height: `${(item.revenue / maxRevenue) * 120}px` }} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-zinc-500">¥{(item.commission / 10000).toFixed(1)}万</span>
                    <div className="w-8 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400" style={{ height: `${(item.commission / maxRevenue) * 120}px` }} />
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{item.month.split("-")[1]}月</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-[#FF6B35]" /><span className="text-xs text-zinc-400">总收入</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-blue-500" /><span className="text-xs text-zinc-400">总佣金</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Requests */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2"><CreditCard className="h-5 w-5 text-[#FF6B35]" />提现申请</CardTitle>
              <CardDescription>审核并处理站点提现请求</CardDescription>
            </div>
            {pendingWithdrawals.length > 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{pendingWithdrawals.length} 条待处理</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">申请时间</TableHead>
                <TableHead className="text-zinc-400">站点</TableHead>
                <TableHead className="text-zinc-400">代理</TableHead>
                <TableHead className="text-zinc-400">金额</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">银行信息</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
                <TableHead className="text-zinc-400 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_WITHDRAWALS.map((w) => (
                <TableRow key={w.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{w.createdAt}</TableCell>
                  <TableCell className="text-zinc-200 font-medium">{w.stationName}</TableCell>
                  <TableCell className="text-zinc-300">{w.agentName}</TableCell>
                  <TableCell className="text-zinc-200 font-bold">¥{w.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-zinc-400 hidden md:table-cell">{w.bankInfo}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[w.status]}>{WITHDRAWAL_STATUS_LABELS[w.status]}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {w.status === "PENDING" && (
                        <>
                          <Button variant="ghost" size="icon-xs" className="text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => { setSelectedWithdrawal(w); setReviewRemark(""); setReviewOpen(true); }}><CheckCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon-xs" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { setSelectedWithdrawal(w); setReviewRemark(""); setReviewOpen(true); }}><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200" onClick={() => { setSelectedWithdrawal(w); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">提现详情</DialogTitle>
            <DialogDescription>{selectedWithdrawal?.stationName}</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-zinc-500">申请金额</span><p className="text-lg font-bold text-white mt-1">¥{selectedWithdrawal.amount.toFixed(2)}</p></div>
                <div><span className="text-zinc-500">状态</span><div className="mt-1"><Badge className={STATUS_COLORS[selectedWithdrawal.status]}>{WITHDRAWAL_STATUS_LABELS[selectedWithdrawal.status]}</Badge></div></div>
              </div>
              <div><span className="text-zinc-500">银行信息</span><p className="text-zinc-300 mt-1">{selectedWithdrawal.bankInfo}</p></div>
              <div><span className="text-zinc-500">申请时间</span><p className="text-zinc-300 mt-1">{selectedWithdrawal.createdAt}</p></div>
              {selectedWithdrawal.remark && <div><span className="text-zinc-500">备注</span><p className="text-zinc-300 mt-1">{selectedWithdrawal.remark}</p></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">审核提现</DialogTitle>
            <DialogDescription>{selectedWithdrawal?.stationName} - ¥{selectedWithdrawal?.amount.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">审核备注</Label>
              <Textarea value={reviewRemark} onChange={(e) => setReviewRemark(e.target.value)} placeholder="请输入审核意见（可选）" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">取消</Button>
            <Button variant="destructive" onClick={() => setReviewOpen(false)}><XCircle className="mr-2 h-4 w-4" />拒绝</Button>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0" onClick={() => setReviewOpen(false)}><CheckCircle className="mr-2 h-4 w-4" />通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
