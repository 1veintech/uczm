"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  Image as ImageIcon,
  FileText,
  Film,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const MOCK_MATERIALS = [
  { id: "m1", title: "春季促销海报 A", type: "IMAGE", url: "https://picsum.photos/seed/material1/800/600", description: "适用于春季水果促销活动，建议打印尺寸 A3", createdAt: "2024-03-10" },
  { id: "m2", title: "春季促销海报 B", type: "IMAGE", url: "https://picsum.photos/seed/material2/800/600", description: "蔬菜专场促销海报，突出新鲜直达", createdAt: "2024-03-10" },
  { id: "m3", title: "新人注册引导", type: "DOCUMENT", url: "#", description: "新站长注册流程详细指南 PDF", createdAt: "2024-03-08" },
  { id: "m4", title: "社群运营手册", type: "DOCUMENT", url: "#", description: "私域社群运营全套方法论", createdAt: "2024-03-05" },
  { id: "m5", title: "产品展示视频模板", type: "VIDEO", url: "#", description: "可用于朋友圈和社群分享的产品展示短视频模板", createdAt: "2024-03-01" },
  { id: "m6", title: "节日活动海报 - 清明", type: "IMAGE", url: "https://picsum.photos/seed/material3/800/600", description: "清明节踏青主题促销海报", createdAt: "2024-02-28" },
  { id: "m7", title: "朋友圈文案合集", type: "DOCUMENT", url: "#", description: "30天朋友圈营销文案模板", createdAt: "2024-02-25" },
  { id: "m8", title: "社群裂变活动方案", type: "DOCUMENT", url: "#", description: "拉新裂变完整方案和话术", createdAt: "2024-02-20" },
];

const TYPE_CONFIG: Record<string, { icon: typeof ImageIcon; color: string; label: string }> = {
  IMAGE: { icon: ImageIcon, color: "text-blue-400 bg-blue-500/10", label: "图片" },
  VIDEO: { icon: Film, color: "text-purple-400 bg-purple-500/10", label: "视频" },
  DOCUMENT: { icon: FileText, color: "text-green-400 bg-green-500/10", label: "文档" },
};

export default function AgentMaterialsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<(typeof MOCK_MATERIALS)[0] | null>(null);

  const filtered = MOCK_MATERIALS.filter((m) => {
    const matchSearch = m.title.includes(search) || m.description.includes(search);
    const matchType = typeFilter === "ALL" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">营销物料</h1>
        <p className="text-sm text-zinc-400 mt-1">下载营销素材，助力站点推广</p>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="搜索物料名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#FF6B35]/50" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-36 bg-zinc-800 border-zinc-700 text-zinc-200">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="ALL">全部类型</SelectItem>
                <SelectItem value="IMAGE">图片</SelectItem>
                <SelectItem value="VIDEO">视频</SelectItem>
                <SelectItem value="DOCUMENT">文档</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Material Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((material) => {
          const config = TYPE_CONFIG[material.type];
          const Icon = config.icon;
          return (
            <Card key={material.id} className="bg-zinc-900 border-zinc-800 group hover:border-zinc-700 transition-all">
              <div className="relative aspect-[4/3] bg-zinc-800 rounded-t-xl overflow-hidden">
                {material.type === "IMAGE" ? (
                  <img src={material.url} alt={material.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Icon className={`h-12 w-12 ${config.color.split(" ")[0]}`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {material.type === "IMAGE" && (
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => { setPreviewMaterial(material); setPreviewOpen(true); }}>
                      <Eye className="mr-1 h-4 w-4" />预览
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Download className="mr-1 h-4 w-4" />下载
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-200 truncate">{material.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{material.description}</p>
                  </div>
                  <Badge variant="outline" className={`shrink-0 border-0 ${config.color}`}>{config.label}</Badge>
                </div>
                <p className="text-xs text-zinc-600 mt-3">{material.createdAt}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center text-zinc-500">未找到匹配的物料</CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{previewMaterial?.title}</DialogTitle>
            <DialogDescription>{previewMaterial?.description}</DialogDescription>
          </DialogHeader>
          {previewMaterial && previewMaterial.type === "IMAGE" && (
            <div className="rounded-lg overflow-hidden bg-zinc-800">
              <img src={previewMaterial.url} alt={previewMaterial.title} className="w-full h-auto" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">关闭</Button>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0"><Download className="mr-2 h-4 w-4" />下载</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
