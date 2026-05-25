"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLAINT_STATUS_LABELS,
  PROBLEM_TYPE_LABELS,
  STATUS_COLORS,
  RESOLVE_TYPES,
} from "@/lib/constants";
import { format } from "date-fns";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  User,
  Calendar,
  FileText,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ComplaintDetailClientProps {
  complaint: {
    id: string;
    problemType: string;
    description: string;
    status: string;
    customerPhone: string;
    customerNickname: string | null;
    images: string;
    orderNo: string | null;
    resolveType: string | null;
    resolveRemark: string | null;
    resolvedAt: string | null;
    createdAt: string;
  };
}

export default function ComplaintDetailClient({
  complaint,
}: ComplaintDetailClientProps) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const [resolveType, setResolveType] = useState("");
  const [resolveRemark, setResolveRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const images: string[] = (() => {
    try {
      return JSON.parse(complaint.images);
    } catch {
      return [];
    }
  })();

  const maskedPhone = complaint.customerPhone.replace(
    /(\d{3})\d{4}(\d{4})/,
    "$1****$2"
  );

  const handleResolve = async () => {
    if (!resolveType) {
      toast.error("请选择处理方式");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveType, resolveRemark }),
      });
      if (res.ok) {
        toast.success("处理成功");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "处理失败");
      }
    } catch {
      toast.error("处理失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/escalate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("已升级处理");
        router.refresh();
      } else {
        toast.error("升级失败");
      }
    } catch {
      toast.error("升级失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/station/complaints">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">客诉详情</h1>
          <p className="text-sm text-gray-400">ID: {complaint.id}</p>
        </div>
        <div className="ml-auto">
          <Badge
            className={`text-sm ${STATUS_COLORS[complaint.status] ?? ""}`}
            variant="outline"
          >
            {COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-1.5">
                  <User className="h-4 w-4 text-blue-500" />
                </div>
                客户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">客户昵称</p>
                    <p className="text-sm font-medium text-gray-900">
                      {complaint.customerNickname ?? "未设置"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">手机号</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 font-mono">
                        {showPhone ? complaint.customerPhone : maskedPhone}
                      </p>
                      <button
                        onClick={() => setShowPhone(!showPhone)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showPhone ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaint details */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                投诉详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">问题类型</p>
                  <Badge variant="outline" className="mt-1 border-gray-200 text-gray-600 bg-gray-50">
                    {PROBLEM_TYPE_LABELS[complaint.problemType] ?? complaint.problemType}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">关联订单</p>
                  <p className="text-sm text-gray-700 font-mono">
                    {complaint.orderNo ?? "无"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    创建时间
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(complaint.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">问题描述</p>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">相关图片</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gray-100 overflow-hidden border border-gray-200 group cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={`图片 ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution info (if resolved) */}
          {complaint.status === "RESOLVED" && complaint.resolveType && (
            <Card className="bg-white border border-emerald-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  处理结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">处理方式</p>
                    <p className="text-sm font-medium text-gray-900">
                      {RESOLVE_TYPES.find((t) => t.value === complaint.resolveType)?.label ??
                        complaint.resolveType}
                    </p>
                  </div>
                  {complaint.resolvedAt && (
                    <div>
                      <p className="text-xs text-gray-400">处理时间</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(complaint.resolvedAt), "yyyy-MM-dd HH:mm:ss")}
                      </p>
                    </div>
                  )}
                </div>
                {complaint.resolveRemark && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">备注</p>
                    <p className="text-sm text-gray-600 rounded-lg bg-gray-50 border border-gray-100 p-3">
                      {complaint.resolveRemark}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          {complaint.status === "PENDING" && (
            <>
              {/* Resolve form */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 text-base font-semibold">处理客诉</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">处理方式</p>
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
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">备注</p>
                    <Textarea
                      placeholder="输入处理备注..."
                      value={resolveRemark}
                      onChange={(e) => setResolveRemark(e.target.value)}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 min-h-[100px]"
                    />
                  </div>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                    onClick={handleResolve}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "处理中..." : "提交处理"}
                  </Button>
                </CardContent>
              </Card>

              {/* Escalate */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 text-base font-semibold">升级处理</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    如果问题无法自行解决，可以升级给区县代理处理
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300"
                    onClick={handleEscalate}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    升级给代理
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {complaint.status === "ESCALATED" && (
            <Card className="bg-white border border-red-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  已升级
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  此客诉已升级给区县代理处理，请等待代理反馈。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
