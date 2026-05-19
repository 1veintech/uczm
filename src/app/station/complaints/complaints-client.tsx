"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  COMPLAINT_STATUS_LABELS,
  PROBLEM_TYPE_LABELS,
  STATUS_COLORS,
  RESOLVE_TYPES,
} from "@/lib/constants";
import { format } from "date-fns";
import { Eye, ArrowUpRight, Search, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

interface Complaint {
  id: string;
  problemType: string;
  description: string;
  status: string;
  customerPhone: string;
  images: string;
  orderNo: string | null;
  resolveType: string | null;
  resolveRemark: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface ComplaintsClientProps {
  complaints: Complaint[];
}

export default function ComplaintsClient({ complaints }: ComplaintsClientProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolveType, setResolveType] = useState("");
  const [resolveRemark, setResolveRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerPhone.includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolve = async () => {
    if (!selectedComplaint || !resolveType) {
      toast.error("请选择处理方式");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveType, resolveRemark }),
      });
      if (res.ok) {
        toast.success("处理成功");
        setSelectedComplaint(null);
        setResolveType("");
        setResolveRemark("");
        window.location.reload();
      } else {
        toast.error("处理失败");
      }
    } catch {
      toast.error("处理失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async (complaintId: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/escalate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("已升级处理");
        window.location.reload();
      } else {
        toast.error("升级失败");
      }
    } catch {
      toast.error("升级失败，请重试");
    }
  };

  const images = selectedComplaint
    ? (() => {
        try {
          return JSON.parse(selectedComplaint.images) as string[];
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">客诉管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理客户投诉，及时处理问题</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索手机号、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:w-64 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v ?? "all")}>
        <TabsList className="bg-gray-100 border border-gray-200 p-1">
          <TabsTrigger
            value="all"
            className="data-[active]:bg-white data-[active]:text-gray-900 data-[active]:shadow-sm text-gray-500"
          >
            全部 ({complaints.length})
          </TabsTrigger>
          <TabsTrigger
            value="PENDING"
            className="data-[active]:bg-white data-[active]:text-amber-600 data-[active]:shadow-sm text-gray-500"
          >
            待处理 ({complaints.filter((c) => c.status === "PENDING").length})
          </TabsTrigger>
          <TabsTrigger
            value="RESOLVED"
            className="data-[active]:bg-white data-[active]:text-emerald-600 data-[active]:shadow-sm text-gray-500"
          >
            已处理 ({complaints.filter((c) => c.status === "RESOLVED").length})
          </TabsTrigger>
          <TabsTrigger
            value="ESCALATED"
            className="data-[active]:bg-white data-[active]:text-red-600 data-[active]:shadow-sm text-gray-500"
          >
            已升级 ({complaints.filter((c) => c.status === "ESCALATED").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-gray-600 font-medium">ID</TableHead>
                  <TableHead className="text-gray-600 font-medium">客户手机</TableHead>
                  <TableHead className="text-gray-600 font-medium">问题类型</TableHead>
                  <TableHead className="text-gray-600 font-medium">描述</TableHead>
                  <TableHead className="text-gray-600 font-medium">状态</TableHead>
                  <TableHead className="text-gray-600 font-medium">时间</TableHead>
                  <TableHead className="text-gray-600 font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquareWarning className="h-8 w-8 text-gray-300" />
                        <span>暂无客诉记录</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="border-t border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <TableCell className="font-mono text-xs text-gray-400">
                        {complaint.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {complaint.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                          {PROBLEM_TYPE_LABELS[complaint.problemType] ?? complaint.problemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-500">
                        {complaint.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${STATUS_COLORS[complaint.status] ?? ""}`}
                          variant="outline"
                        >
                          {COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {format(new Date(complaint.createdAt), "MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/station/complaints/${complaint.id}`}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {complaint.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalate(complaint.id);
                              }}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedComplaint}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedComplaint(null);
            setResolveType("");
            setResolveRemark("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">客诉详情</DialogTitle>
            <DialogDescription className="text-gray-500">
              查看客诉详细信息并进行处理
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">客户手机</p>
                  <p className="text-sm font-medium text-gray-900">{selectedComplaint.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">问题类型</p>
                  <p className="text-sm font-medium text-gray-900">
                    {PROBLEM_TYPE_LABELS[selectedComplaint.problemType] ?? selectedComplaint.problemType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">状态</p>
                  <Badge
                    className={`text-xs mt-0.5 ${STATUS_COLORS[selectedComplaint.status] ?? ""}`}
                    variant="outline"
                  >
                    {COMPLAINT_STATUS_LABELS[selectedComplaint.status] ?? selectedComplaint.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">创建时间</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedComplaint.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">问题描述</p>
                <p className="text-sm text-gray-700 rounded-lg bg-gray-50 border border-gray-100 p-3">
                  {selectedComplaint.description}
                </p>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">相关图片</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gray-100 overflow-hidden border border-gray-200"
                      >
                        <img
                          src={img}
                          alt={`图片 ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.status === "PENDING" && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-900">处理客诉</p>
                  <Select value={resolveType} onValueChange={(v) => setResolveType(v ?? "refund")}>
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                      <SelectValue placeholder="选择处理方式" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {RESOLVE_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-gray-900 hover:bg-gray-50"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="处理备注..."
                    value={resolveRemark}
                    onChange={(e) => setResolveRemark(e.target.value)}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              )}

              {selectedComplaint.status === "RESOLVED" && selectedComplaint.resolveType && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">处理结果</p>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1">
                    <p className="text-sm text-gray-700">
                      处理方式: {RESOLVE_TYPES.find((t) => t.value === selectedComplaint.resolveType)?.label ?? selectedComplaint.resolveType}
                    </p>
                    {selectedComplaint.resolveRemark && (
                      <p className="text-sm text-gray-500">备注: {selectedComplaint.resolveRemark}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedComplaint?.status === "PENDING" && (
              <>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    if (selectedComplaint) handleEscalate(selectedComplaint.id);
                  }}
                >
                  升级处理
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                  onClick={handleResolve}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "处理中..." : "提交处理"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
