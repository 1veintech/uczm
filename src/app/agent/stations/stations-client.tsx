"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  MapPin,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  STATION_STATUS_LABELS,
  PLAN_TYPE_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";

interface StationData {
  id: string;
  name: string;
  phone: string;
  address: string;
  planType: string;
  status: string;
  region: string;
  createdAt: string;
  orders: number;
  complaints: number;
}

export function StationsClient({ stations, agentRegion, agentId }: { stations: StationData[]; agentRegion: string; agentId?: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", phone: "", address: "" });
  const [creating, setCreating] = useState(false);
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<StationData | null>(null);
  const [regionAction, setRegionAction] = useState<"assign" | "remove">("assign");
  const [saving, setSaving] = useState(false);

  const filteredStations = stations.filter((station) => {
    const matchSearch =
      station.name.includes(search) ||
      station.phone.includes(search) ||
      station.address.includes(search);
    const matchStatus =
      statusFilter === "ALL" || station.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateStation = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/agent/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStation),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("创建成功，初始密码为 123456");
        setCreateOpen(false);
        setNewStation({ name: "", phone: "", address: "" });
        window.location.reload();
      } else {
        toast.error(data.error || "创建失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setCreating(false);
    }
  };

  const openRegionDialog = (station: StationData, action: "assign" | "remove") => {
    setEditingStation(station);
    setRegionAction(action);
    setRegionDialogOpen(true);
  };

  const handleUpdateRegion = async () => {
    if (!editingStation) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stations/${editingStation.id}/agent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: regionAction === "assign" ? agentId : null,
        }),
      });
      if (res.ok) {
        toast.success(regionAction === "assign" ? "已分配到当前区域" : "已移出当前区域");
        setRegionDialogOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "操作失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">站长管理</h1>
          <p className="text-sm text-zinc-400 mt-1">管理辖区内所有站长信息 · 区域: {agentRegion}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#FF8F65] hover:to-[#FF6B35] text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              创建站长
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">创建新站长</DialogTitle>
              <DialogDescription>
                填写站长信息完成创建，默认密码为 123456
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">站长名称</Label>
                <Input value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })} placeholder="请输入站长名称" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">手机号</Label>
                <Input value={newStation.phone} onChange={(e) => setNewStation({ ...newStation, phone: e.target.value })} placeholder="请输入手机号" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <div>
                <Label className="text-zinc-300">站点地址</Label>
                <Input value={newStation.address} onChange={(e) => setNewStation({ ...newStation, address: e.target.value })} placeholder="请输入站点地址" className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">取消</Button>
              <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0" disabled={!newStation.name || !newStation.phone || !newStation.address || creating} onClick={handleCreateStation}>
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="搜索站长名称、手机号、地址..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#FF6B35]/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-800 border-zinc-700 text-zinc-200">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="ALL">全部状态</SelectItem>
                {Object.entries(STATION_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Station Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">站长名称</TableHead>
                <TableHead className="text-zinc-400">手机号</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">地址</TableHead>
                <TableHead className="text-zinc-400">版本</TableHead>
                <TableHead className="text-zinc-400">区域</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">注册时间</TableHead>
                <TableHead className="text-zinc-400 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow
                  key={station.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                        <span className="text-white text-xs font-medium">
                          {station.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-zinc-200">
                        {station.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{station.phone}</TableCell>
                  <TableCell className="text-zinc-400 hidden md:table-cell max-w-[200px] truncate">
                    {station.address}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        station.planType === "ADVANCED"
                          ? "border-[#FF6B35]/30 text-[#FF6B35]"
                          : "border-zinc-600 text-zinc-400"
                      }
                    >
                      {PLAN_TYPE_LABELS[station.planType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {station.region}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[station.status]}>
                      {STATION_STATUS_LABELS[station.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 hidden lg:table-cell">
                    {station.createdAt.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {station.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => openRegionDialog(station, station.region ? "remove" : "assign")}
                        title={station.region ? "移出区域" : "分配区域"}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Link href={`/agent/stations/${station.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-zinc-400 hover:text-zinc-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredStations.length === 0 && (
            <div className="py-12 text-center text-zinc-500">未找到匹配的站长</div>
          )}
        </CardContent>
      </Card>

      {/* Region modification dialog */}
      <Dialog open={regionDialogOpen} onOpenChange={setRegionDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">修改负责区域</DialogTitle>
            <DialogDescription>
              {regionAction === "assign"
                ? `将站点「${editingStation?.name}」分配到区域「${agentRegion}」`
                : `将站点「${editingStation?.name}」移出当前区域`}
            </DialogDescription>
          </DialogHeader>
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
              className={regionAction === "assign"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"}
            >
              {saving ? "保存中..." : regionAction === "assign" ? "确认分配" : "确认移出"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
