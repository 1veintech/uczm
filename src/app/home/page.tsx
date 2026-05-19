import Link from "next/link";
import {
  ShoppingCart,
  Store,
  Users,
  Shield,
  Smartphone,
  ArrowRight,
  BarChart3,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const interfaces = [
    {
      href: "/",
      icon: Smartphone,
      label: "C端客户",
      desc: "手机端 - 报损、商城、招工、爆品推荐",
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      tag: "客户入口",
      tagColor: "bg-blue-100 text-blue-600",
    },
    {
      href: "/station",
      icon: Store,
      label: "站长后台",
      desc: "客诉管理、商城管理、招聘管理、收入统计",
      color: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-500/20",
      tag: "核心功能",
      tagColor: "bg-indigo-100 text-indigo-600",
    },
    {
      href: "/agent",
      icon: Users,
      label: "代理后台",
      desc: "站长管理、数据看板、收入结算、营销物料",
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      tag: "区域管理",
      tagColor: "bg-emerald-100 text-emerald-600",
    },
    {
      href: "/admin",
      icon: Shield,
      label: "超级后台",
      desc: "代理管理、财务管理、版本定价、系统配置",
      color: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/20",
      tag: "全局管控",
      tagColor: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute top-20 left-1/3 w-2 h-2 rounded-full bg-white/20" />
          <div className="absolute top-40 right-1/4 w-3 h-3 rounded-full bg-white/15" />
        </div>

        <div className="relative z-10 text-center pt-16 pb-20 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-5 shadow-xl">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" fill="white" fillOpacity="0.2"/>
              <path d="M20 12c-3 0-6 2.5-6 6s2.5 6 6 6 6-2.5 6-6-3-6-6-6z" fill="white"/>
              <path d="M12 18c-1.5.5-3 2-3 4s1.5 3.5 3 4 3 0 4-1-2-2.5-2-4-1-3-2-4-2.5-.5-4 1z" fill="white" fillOpacity="0.6"/>
              <path d="M28 18c1.5.5 3 2 3 4s-1.5 3.5-3 4-3 0-4-1 2-2.5 2-4 1-3 2-4 2.5-.5 4 1z" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">优采智管</h1>
          <p className="text-blue-100/80 text-sm mt-2">站长私域经营系统</p>
          <p className="text-blue-200/60 text-xs mt-3 max-w-xs mx-auto">
            专为优采智管站长设计的私域经营SaaS系统
          </p>
        </div>
      </div>

      {/* Interface Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-8 relative z-10 pb-8 space-y-3">
        {interfaces.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-50 group-hover:border-blue-100">
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md ${item.shadow}`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-800">{item.label}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.tagColor}`}>{item.tag}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-500" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-50">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Zap size={18} className="text-blue-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">高效管理</p>
            <p className="text-[10px] text-gray-400 mt-0.5">快速响应</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-50">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <Shield size={18} className="text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">安全可靠</p>
            <p className="text-[10px] text-gray-400 mt-0.5">数据加密</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-50">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mx-auto mb-2">
              <BarChart3 size={18} className="text-violet-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">智能分析</p>
            <p className="text-[10px] text-gray-400 mt-0.5">数据驱动</p>
          </div>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-[10px] text-gray-300">优采智管私域管理系统 v1.0</p>
      </div>
    </div>
  );
}
