"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Filter,
  Users,
  CheckCircle,
  Clock,
  Ban,
  MapPin,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  STATION_STATUS_LABELS,
  PLAN_TYPE_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";

interface StationData {
  id: string;
  userId: string;
  name: string;
  agentId: string | null;
  agentName: string;
  region: string;
  phone: string;
  address: string;
  planType: string;
  status: string;
  customers: number;
  orders: number;
}

interface AgentOption {
  id: string;
  name: string;
  region: string;
}

export function AdminStationsClient({ stations, agents }: { stations: StationData[]; agents: AgentOption[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<StationData | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [saving, setSaving] = useState(false);

  const uniqueAgents = [...new Set(stations.map((s) => s.agentName))];

  const filtered = stations.filter((station) => {
    const matchSearch = station.name.includes(search) || station.phone.includes(search) || station.address.includes(search);
    const matchStatus = statusFilter === "ALL" || station.status === statusFilter;
    const matchPlan = planFilter === "ALL" || station.planType === planFilter;
    const matchAgent = agentFilter === "ALL" || station.agentName === agentFilter;
    return matchSearch && matchStatus && matchPlan && matchAgent;
  });

  const statusCounts = {
    total: stations.length,
    approved: stations.filter((s) => s.status === "APPROVED").length,
    pending: stations.filter((s) => s.status === "PENDING").length,
    disabled: stations.filter((s) => s.status === "DISABLED").length,
  };

  const handleResetPassword = async (userId: string) => {
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("密码已重置为 123456");
    } else {
      toast.error(data.error || "重置失败");
    }
  };

  const openRegionDialog = (station: StationData) => {
    setEditingStation(station);
    setSelectedAgentId(station.agentId || "");
    setRegionDialogOpen(true);
  };

  const handleUpdateRegion = async () => {
    if (!editingStation) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stations/${editingStation.id}/agent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgentId || null }),
      });
      if (res.ok) {
        toast.success("负责区域已更新");
        setRegionDialogOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "更新失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">站长总览</h1>
        <p className="text-sm text-zinc-400 mt-1">查看并管理平台所有站点</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10"><Users className="h-5 w-5 text-blue-400" /></div><div><p className="text-2xl font-bold text-white">{statusCounts.total}</p><p className="text-xs text-zinc-400">总站点</p></div></div></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-400" /></div><div><p className="text-2xl font-bold text-green-400">{statusCounts.approved}</p><p className="text-xs text-zinc-400">已通过</p></div></div></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div><div><p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p><p className="text-xs text-zinc-400">待审核</p></div></div></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><Ban className="h-5 w-5 text-red-400" /></div><div><p className="text-2xl font-bold text-red-400">{statusCounts.disabled}</p><p className="text-xs text-zinc-400">已停用</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="搜索站点名称、手机号、地址..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#FF6B35]/50" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-32 bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectItem value="ALL" className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">全部状态</SelectItem>
                {Object.entries(STATION_STATUS_LABELS).map(([key, label]) => (<SelectItem key={key} value={key} className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">{label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(v) => setPlanFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-32 bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue placeholder="版本" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectItem value="ALL" className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">全部版本</SelectItem>
                {Object.entries(PLAN_TYPE_LABELS).map(([key, label]) => (<SelectItem key={key} value={key} className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">{label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={(v) => setAgentFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-32 bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue placeholder="代理" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectItem value="ALL" className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">全部代理</SelectItem>
                {uniqueAgents.map((agent) => (<SelectItem key={agent} value={agent} className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">{agent}</SelectItem>))}
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
                <TableHead className="text-zinc-400">站点名称</TableHead>
                <TableHead className="text-zinc-400">代理</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">区域</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">地址</TableHead>
                <TableHead className="text-zinc-400">版本</TableHead>
                <TableHead className="text-zinc-400 text-center hidden lg:table-cell">客户</TableHead>
                <TableHead className="text-zinc-400 text-center hidden lg:table-cell">订单</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
                <TableHead className="text-zinc-400 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((station) => (
                <TableRow key={station.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                        <span className="text-white text-xs font-medium">{station.name.charAt(0)}</span>
                      </div>
                      <div><span className="font-medium text-zinc-200 block">{station.name}</span><span className="text-xs text-zinc-500">{station.phone}</span></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{station.agentName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {station.region ? (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {station.region}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">未分配</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-400 hidden md:table-cell max-w-[200px] truncate">{station.address}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={station.planType === "ADVANCED" ? "border-[#FF6B35]/30 text-[#FF6B35]" : "border-zinc-600 text-zinc-400"}>{PLAN_TYPE_LABELS[station.planType]}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-zinc-200 hidden lg:table-cell">{station.customers}</TableCell>
                  <TableCell className="text-center text-zinc-200 hidden lg:table-cell">{station.orders}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[station.status]}>{STATION_STATUS_LABELS[station.status]}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => openRegionDialog(station)}
                        title="修改负责区域"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" title="重置密码" onClick={() => handleResetPassword(station.userId)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <div className="py-12 text-center text-zinc-500">未找到匹配的站点</div>}
        </CardContent>
      </Card>

      {/* Region modification dialog */}
      <Dialog open={regionDialogOpen} onOpenChange={setRegionDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">修改负责区域</DialogTitle>
            <DialogDescription>
              为站点「{editingStation?.name}」选择所属代理区域
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedAgentId} onValueChange={(v) => setSelectedAgentId(v ?? "")}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectValue placeholder="选择代理区域" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectItem value="" className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">未分配</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="text-zinc-200 focus:text-zinc-100 focus:bg-zinc-700">
                    {agent.name} - {agent.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegionDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateRegion}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {saving ? "保存中..." : "确认修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
