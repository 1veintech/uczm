"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  MapPin,
  Save,
  Info,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RegionMap = dynamic(
  () => import("@/components/region-map/region-map"),
  { ssr: false }
);

interface RegionClientProps {
  agentId: string;
  agentName: string;
  region: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  regionBounds: [number, number][];
  stations: {
    id: string;
    name: string;
    address: string;
    status: string;
  }[];
}

export default function RegionClient({
  agentId,
  agentName,
  region,
  centerLat,
  centerLng,
  zoomLevel,
  regionBounds: initialBounds,
  stations,
}: RegionClientProps) {
  const [bounds, setBounds] = useState<[number, number][]>(initialBounds);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (bounds.length < 3) {
      toast.error("请至少绘制3个点形成闭合区域");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/agent/region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          regionBounds: bounds,
          centerLat,
          centerLng,
          zoomLevel,
        }),
      });
      if (res.ok) {
        toast.success("区域边界已保存");
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
    APPROVED: { label: "正常", icon: CheckCircle, color: "text-green-500" },
    PENDING: { label: "待审核", icon: AlertTriangle, color: "text-amber-500" },
    REJECTED: { label: "已拒绝", icon: XCircle, color: "text-red-500" },
    DISABLED: { label: "已停用", icon: XCircle, color: "text-gray-500" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">区域管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理 {agentName} 的负责区域范围
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-600 border-0">{region}</Badge>
          <Badge className={bounds.length >= 3 ? "bg-green-100 text-green-600 border-0" : "bg-amber-100 text-amber-600 border-0"}>
            {bounds.length >= 3 ? "已设置边界" : "未设置边界"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map - 2 columns */}
        <Card className="bg-white border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                区域边界地图
              </CardTitle>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || bounds.length < 3}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                {saving ? "保存中..." : "保存区域"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RegionMap
              center={[centerLat, centerLng]}
              zoom={zoomLevel}
              bounds={bounds}
              editable={true}
              onChange={setBounds}
              regionName={region}
              height="450px"
            />

            {/* Instructions */}
            <div className="mt-3 bg-blue-50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-600 space-y-1">
                  <p>1. 点击"开始绘制区域"按钮进入绘制模式</p>
                  <p>2. 在地图上点击选择区域边界点（至少3个点）</p>
                  <p>3. 点击"完成绘制"形成闭合区域</p>
                  <p>4. 点击"保存区域"将边界信息保存到服务器</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Stations in region */}
        <div className="space-y-6">
          {/* Region Info */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-base">区域信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">区域名称</span>
                <span className="text-sm font-medium text-slate-700">{region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">代理负责人</span>
                <span className="text-sm font-medium text-slate-700">{agentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">站点数量</span>
                <span className="text-sm font-medium text-slate-700">{stations.length}个</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">边界状态</span>
                <span className={`text-sm font-medium ${bounds.length >= 3 ? "text-green-600" : "text-amber-500"}`}>
                  {bounds.length >= 3 ? "已划定" : "待划定"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">边界顶点</span>
                <span className="text-sm font-medium text-slate-700">{bounds.length} 个</span>
              </div>
            </CardContent>
          </Card>

          {/* Stations List */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-500" />
                辖区站点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stations.map((station) => {
                  const cfg = statusConfig[station.status] || statusConfig.APPROVED;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={station.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{station.name}</p>
                        <p className="text-xs text-slate-400 truncate">{station.address}</p>
                      </div>
                      <span className={`text-[10px] ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  );
                })}
                {stations.length === 0 && (
                  <p className="text-center text-slate-400 py-6 text-sm">暂无站点</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
