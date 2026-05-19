"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  Eye,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  COMPLAINT_STATUS_LABELS,
  PROBLEM_TYPE_LABELS,
  STATUS_COLORS,
  RESOLVE_TYPES,
} from "@/lib/constants";

interface ComplaintData {
  id: string;
  stationName: string;
  problemType: string;
  description: string;
  status: string;
  createdAt: string;
  images: string[];
  resolveType: string | null;
  resolveRemark: string | null;
}

export function AgentComplaintsClient({ complaints }: { complaints: ComplaintData[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detailOpen, setDetailOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [resolveType, setResolveType] = useState("");
  const [resolveRemark, setResolveRemark] = useState("");

  const filtered = complaints.filter((c) => {
    const matchSearch = c.stationName.includes(search) || c.description.includes(search);
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">代处理工单</h1>
        <p className="text-sm text-zinc-400 mt-1">处理从各站点升级上来的客诉工单</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{complaints.filter((c) => c.status === "PENDING").length}</p>
            <p className="text-xs text-zinc-400">待处理</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{complaints.filter((c) => c.status === "ESCALATED").length}</p>
            <p className="text-xs text-zinc-400">已升级</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{complaints.filter((c) => c.status === "RESOLVED").length}</p>
            <p className="text-xs text-zinc-400">已处理</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="搜索站点名称、描述..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#FF6B35]/50" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-800 border-zinc-700 text-zinc-200">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="ALL">全部状态</SelectItem>
                {Object.entries(COMPLAINT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
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
                <TableHead className="text-zinc-400">站点</TableHead>
                <TableHead className="text-zinc-400">问题类型</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">描述</TableHead>
                <TableHead className="text-zinc-400">状态</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">时间</TableHead>
                <TableHead className="text-zinc-400 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((complaint) => (
                <TableRow key={complaint.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-200">{complaint.stationName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                      {PROBLEM_TYPE_LABELS[complaint.problemType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 max-w-[200px] truncate hidden md:table-cell">{complaint.description}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[complaint.status]}>{COMPLAINT_STATUS_LABELS[complaint.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 hidden lg:table-cell">{complaint.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200" onClick={() => { setSelectedComplaint(complaint); setDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {complaint.status !== "RESOLVED" && (
                        <Button variant="ghost" size="icon-xs" className="text-[#FF6B35] hover:text-[#FF8F65] hover:bg-[#FF6B35]/10" onClick={() => { setSelectedComplaint(complaint); setResolveType(""); setResolveRemark(""); setResolveOpen(true); }}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <div className="py-12 text-center text-zinc-500">未找到匹配的工单</div>}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">工单详情</DialogTitle>
            <DialogDescription>{selectedComplaint?.stationName}</DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">问题类型</span>
                  <p className="text-zinc-200 mt-1">{PROBLEM_TYPE_LABELS[selectedComplaint.problemType]}</p>
                </div>
                <div>
                  <span className="text-zinc-500">状态</span>
                  <div className="mt-1"><Badge className={STATUS_COLORS[selectedComplaint.status]}>{COMPLAINT_STATUS_LABELS[selectedComplaint.status]}</Badge></div>
                </div>
              </div>
              <div>
                <span className="text-sm text-zinc-500">问题描述</span>
                <p className="text-sm text-zinc-300 mt-1 bg-zinc-800 rounded-lg p-3">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.images.length > 0 && (
                <div>
                  <span className="text-sm text-zinc-500">图片凭证</span>
                  <div className="flex gap-2 mt-2">
                    {selectedComplaint.images.map((img: string, idx: number) => (
                      <div key={idx} className="h-20 w-20 rounded-lg bg-zinc-800 overflow-hidden">
                        <img src={img} alt={`凭证${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedComplaint.resolveType && (
                <div>
                  <span className="text-sm text-zinc-500">处理结果</span>
                  <p className="text-sm text-zinc-300 mt-1 bg-zinc-800 rounded-lg p-3">
                    {RESOLVE_TYPES.find((r) => r.value === selectedComplaint.resolveType)?.label}
                    {selectedComplaint.resolveRemark && ` - ${selectedComplaint.resolveRemark}`}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">处理工单</DialogTitle>
            <DialogDescription>选择处理方式并填写备注，处理后工单将关闭</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">处理方式</Label>
              <Select value={resolveType} onValueChange={(v) => setResolveType(v ?? "refund")}>
                <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="请选择处理方式" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {RESOLVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">处理备注</Label>
              <Textarea value={resolveRemark} onChange={(e) => setResolveRemark(e.target.value)} placeholder="请填写处理详情..." className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">取消</Button>
            <Button
              className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0"
              disabled={!resolveType}
              onClick={async () => {
                if (!selectedComplaint) return;
                await fetch("/api/agent/complaints/resolve", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: selectedComplaint.id, resolveType, resolveRemark }),
                });
                setResolveOpen(false);
                window.location.reload();
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />确认处理
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
