"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Plus,
  Check,
  Smartphone,
  Headphones,
  Globe,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const MOCK_MATERIALS = [
  { id: "m1", title: "春季促销海报 A", type: "IMAGE", url: "https://picsum.photos/seed/sys1/800/600" },
  { id: "m2", title: "运营手册", type: "DOCUMENT", url: "#" },
  { id: "m3", title: "推广视频模板", type: "VIDEO", url: "#" },
];

export default function AdminSystemPage() {
  const [appName, setAppName] = useState("优采智管私域管理系统");
  const [customerPhone, setCustomerPhone] = useState("400-888-8888");
  const [appUrl, setAppUrl] = useState("https://ddcm.com");
  const [copyright, setCopyright] = useState("2024 优采智管 版权所有");
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">系统配置</h1>
          <p className="text-sm text-zinc-400 mt-1">全局系统设置与物料管理</p>
        </div>
        <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0" onClick={handleSave}>
          {saved ? (<><Check className="mr-2 h-4 w-4" />已保存</>) : (<><Save className="mr-2 h-4 w-4" />保存设置</>)}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* App Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Smartphone className="h-5 w-5 text-[#FF6B35]" />应用设置</CardTitle>
            <CardDescription>基础应用信息配置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-zinc-300">应用名称</Label><Input value={appName} onChange={(e) => setAppName(e.target.value)} className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
            <div><Label className="text-zinc-300">客服电话</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
            <div><Label className="text-zinc-300">应用网址</Label><Input value={appUrl} onChange={(e) => setAppUrl(e.target.value)} className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
            <div><Label className="text-zinc-300">版权信息</Label><Input value={copyright} onChange={(e) => setCopyright(e.target.value)} className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
          </CardContent>
        </Card>

        {/* Announcement */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Globe className="h-5 w-5 text-[#FF6B35]" />系统公告</CardTitle>
            <CardDescription>设置全局公告内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">公告内容</Label>
              <Textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="输入公告内容，留空则不显示公告..." className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 min-h-[200px]" />
            </div>
            <p className="text-xs text-zinc-500">公告将显示在所有站长的首页顶部。留空则不显示。</p>
          </CardContent>
        </Card>
      </div>

      {/* Material Management */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2"><Upload className="h-5 w-5 text-[#FF6B35]" />物料管理</CardTitle>
              <CardDescription>上传和管理全平台营销物料</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Plus className="mr-2 h-4 w-4" />上传物料</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_MATERIALS.map((material) => (
              <div key={material.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4 hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${material.type === "IMAGE" ? "bg-blue-500/10" : material.type === "VIDEO" ? "bg-purple-500/10" : "bg-green-500/10"}`}>
                    {material.type === "IMAGE" ? <ImageIcon className="h-5 w-5 text-blue-400" /> : material.type === "VIDEO" ? <ImageIcon className="h-5 w-5 text-purple-400" /> : <FileText className="h-5 w-5 text-green-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{material.title}</p>
                    <Badge variant="outline" className={`mt-1 text-xs ${material.type === "IMAGE" ? "border-blue-500/30 text-blue-400" : material.type === "VIDEO" ? "border-purple-500/30 text-purple-400" : "border-green-500/30 text-green-400"}`}>
                      {material.type === "IMAGE" ? "图片" : material.type === "VIDEO" ? "视频" : "文档"}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">拖拽文件到此处或点击上传</p>
            <p className="text-xs text-zinc-600 mt-1">支持 JPG、PNG、PDF、MP4 格式，最大 50MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><Settings className="h-6 w-6 text-zinc-400 mx-auto mb-2" /><p className="text-sm text-zinc-400">系统版本</p><p className="text-lg font-bold text-white mt-1">v1.0.0</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><Headphones className="h-6 w-6 text-zinc-400 mx-auto mb-2" /><p className="text-sm text-zinc-400">客服热线</p><p className="text-lg font-bold text-white mt-1">{customerPhone}</p></CardContent></Card>
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><Globe className="h-6 w-6 text-zinc-400 mx-auto mb-2" /><p className="text-sm text-zinc-400">应用网址</p><p className="text-lg font-bold text-white mt-1 truncate">{appUrl}</p></CardContent></Card>
      </div>
    </div>
  );
}
