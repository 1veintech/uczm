"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Star,
  Save,
  BarChart3,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BASIC_FEATURES = [
  "基础客户管理", "订单管理", "客诉处理 (基础)", "商品发布 (50个)",
  "基础数据统计", "社群管理工具", "标准营销物料",
];

const ADVANCED_FEATURES = [
  "全部基础功能", "高级客户画像分析", "智能订单推荐", "客诉自动升级",
  "商品发布 (无限)", "高级数据看板", "专属社群运营工具",
  "定制营销物料", "优先客服支持", "API 对接能力",
];

export default function AdminPlansPage() {
  const [basicPrice, setBasicPrice] = useState("99");
  const [advancedPrice, setAdvancedPrice] = useState("299");
  const [agentBasicPrice, setAgentBasicPrice] = useState("69");
  const [agentAdvancedPrice, setAgentAdvancedPrice] = useState("209");
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">版本定价</h1>
          <p className="text-sm text-zinc-400 mt-1">管理产品版本与价格体系</p>
        </div>
        <Button className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0" onClick={handleSave}>
          {saved ? (<><Check className="mr-2 h-4 w-4" />已保存</>) : (<><Save className="mr-2 h-4 w-4" />保存设置</>)}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Plan */}
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-700 to-transparent opacity-20 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700"><Star className="h-5 w-5 text-zinc-300" /></div>
              <div><CardTitle className="text-lg text-white">基础版</CardTitle><CardDescription>适合初创站点</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-2"><span className="text-4xl font-bold text-white">¥{basicPrice}</span><span className="text-zinc-400 mb-1">/月</span></div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-300">功能清单</p>
              {BASIC_FEATURES.map((f) => (<div key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400 shrink-0" /><span className="text-sm text-zinc-400">{f}</span></div>))}
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-300">价格设置</p>
              <div><Label className="text-zinc-400 text-xs">站长售价 (元/月)</Label><Input type="number" value={basicPrice} onChange={(e) => setBasicPrice(e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
              <div><Label className="text-zinc-400 text-xs">代理底价 (元/月)</Label><Input type="number" value={agentBasicPrice} onChange={(e) => setAgentBasicPrice(e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
              <p className="text-xs text-zinc-500">代理利润: ¥{(parseFloat(basicPrice) - parseFloat(agentBasicPrice)).toFixed(2)}/月</p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Plan */}
        <Card className="bg-zinc-900 border-[#FF6B35]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B35] to-transparent opacity-10 rounded-bl-full" />
          <div className="absolute top-3 right-3"><Badge className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-0"><Crown className="mr-1 h-3 w-3" />推荐</Badge></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]"><Crown className="h-5 w-5 text-white" /></div>
              <div><CardTitle className="text-lg text-white">高级版</CardTitle><CardDescription>适合成熟站点</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-2"><span className="text-4xl font-bold text-[#FF6B35]">¥{advancedPrice}</span><span className="text-zinc-400 mb-1">/月</span></div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-300">功能清单</p>
              {ADVANCED_FEATURES.map((f) => (<div key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FF6B35] shrink-0" /><span className="text-sm text-zinc-400">{f}</span></div>))}
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-300">价格设置</p>
              <div><Label className="text-zinc-400 text-xs">站长售价 (元/月)</Label><Input type="number" value={advancedPrice} onChange={(e) => setAdvancedPrice(e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
              <div><Label className="text-zinc-400 text-xs">代理底价 (元/月)</Label><Input type="number" value={agentAdvancedPrice} onChange={(e) => setAgentAdvancedPrice(e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200" /></div>
              <p className="text-xs text-zinc-500">代理利润: ¥{(parseFloat(advancedPrice) - parseFloat(agentAdvancedPrice)).toFixed(2)}/月</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#FF6B35]" />价格对比</CardTitle>
          <CardDescription>各版本价格与利润一览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-zinc-800/50 p-4"><p className="text-xs text-zinc-500">基础版利润率</p><p className="text-2xl font-bold text-white mt-1">{(((parseFloat(basicPrice) - parseFloat(agentBasicPrice)) / parseFloat(basicPrice)) * 100).toFixed(0)}%</p></div>
            <div className="rounded-lg bg-zinc-800/50 p-4"><p className="text-xs text-zinc-500">高级版利润率</p><p className="text-2xl font-bold text-[#FF6B35] mt-1">{(((parseFloat(advancedPrice) - parseFloat(agentAdvancedPrice)) / parseFloat(advancedPrice)) * 100).toFixed(0)}%</p></div>
            <div className="rounded-lg bg-zinc-800/50 p-4"><p className="text-xs text-zinc-500">高级版溢价</p><p className="text-2xl font-bold text-purple-400 mt-1">{((parseFloat(advancedPrice) / parseFloat(basicPrice) - 1) * 100).toFixed(0)}%</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
