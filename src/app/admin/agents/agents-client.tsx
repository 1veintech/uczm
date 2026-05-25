"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Eye,
  Power,
  Filter,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STATUS_COLORS } from "@/lib/constants";

interface AgentData {
  id: string;
  userId: string;
  name: string;
  phone: string;
  region: string;
  stationCount: number;
  totalSales: number;
  commission: number;
  commissionRate: number;
  status: string;
  createdAt: string;
}

export function AdminAgentsClient({ agents }: { agents: AgentData[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", phone: "", region: "", commissionRate: "0.1" });

  const filtered = agents.filter((agent) => {
    const matchSearch = agent.name.includes(search) || agent.phone.includes(search) || agent.region.includes(search);
    const matchStatus = statusFilter === "ALL" || agent.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAgent),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("创建成功，初始密码为 123456");
      setCreateOpen(false);
      window.location.reload();
    } else {
      toast.error(data.error || "创建失败");
    }
  };

  const handleResetPassword = async (agentId: string) => {
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: agentId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("密码已重置为 123456");
    } else {
      toast.error(data.error || "重置失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">代理管理</h1>
          <p className="text-sm text-zinc-400 mt-1">管理所有区县代理信息</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0">
              <Plus className="mr-2 h-4 w-4" />创建代理
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">创建新代理</DialogTitle>
              <DialogDescription>填写代理信息完成创建</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">代理名称</Label>
                <Input value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} placeholder="请输入代理名称" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">手机号</Label>
                <Input value={newAgent.phone} onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })} placeholder="请输入手机号" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">负责区域</Label>
                <Input value={newAgent.region} onChange={(e) => setNewAgent({ ...newAgent, region: e.target.value })} placeholder="例如: 杭州市西湖区" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">佣金比例</Label>
                <Select value={newAgent.commissionRate} onValueChange={(v) => setNewAgent({ ...newAgent, commissionRate: v ?? "0.1" })}>
                  <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="0.05">5%</SelectItem>
                    <SelectItem value="0.08">8%</SelectItem>
                    <SelectItem value="0.1">10%</SelectItem>
                    <SelectItem value="0.12">12%</SelectItem>
                    <SelectItem value="0.15">15%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">取消</Button>
              <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0" disabled={!newAgent.name || !newAgent.phone || !newAgent.region} onClick={handleCreate}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-white">{agents.length}</p><p className="text-xs text-zinc-400">总代理数</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-400">{agents.filter((a) => a.status === "ACTIVE").length}</p><p className="text-xs text-zinc-400">活跃代理</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-white">{agents.reduce((sum, a) => sum + a.stationCount, 0)}</p><p className="text-xs text-zinc-400">覆盖站长</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-[#FF6B35]">¥{(agents.reduce((sum, a) => sum + a.totalSales, 0) / 10000).toFixed(1)}万</p><p className="text-xs text-zinc-400">总销售额</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="搜索代理名称、手机号、区域..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#FF6B35]/50" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-800 border-zinc-700 text-zinc-200"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="状态筛选" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="ALL">全部状态</SelectItem>
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="SUSPENDED">已停用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">代理名称</TableHead>
                <TableHead className="text-zinc-400">手机号</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">区域</TableHead>
                <TableHead className="text-zinc-400 text-center">站长数</TableHead>
                <TableHead className="text-zinc-400 text-right hidden lg:table-cell">销售额</TableHead>
                <TableHead className="text-zinc-400 text-right hidden lg:table-cell">佣金</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
                <TableHead className="text-zinc-400 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agent) => (
                <TableRow key={agent.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-zinc-200">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{agent.phone}</TableCell>
                  <TableCell className="text-zinc-400 hidden md:table-cell">{agent.region}</TableCell>
                  <TableCell className="text-center text-zinc-200">{agent.stationCount}</TableCell>
                  <TableCell className="text-right text-zinc-200 hidden lg:table-cell">¥{agent.totalSales.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-400 hidden lg:table-cell">¥{agent.commission.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={agent.status === "ACTIVE" ? STATUS_COLORS["ACTIVE"] : STATUS_COLORS["SUSPENDED"]}>
                      {agent.status === "ACTIVE" ? "活跃" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/agents/${agent.id}`}>
                        <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon-xs" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" title="重置密码" onClick={() => handleResetPassword(agent.userId)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" className={agent.status === "ACTIVE" ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10"}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <div className="py-12 text-center text-zinc-500">未找到匹配的代理</div>}
        </CardContent>
      </Card>
    </div>
  );
}
