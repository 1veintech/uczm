"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardClient from "./dashboard-client";

export default function StationDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setLoading(false);
      return;
    }

    fetch("/api/station-data", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">正在验证登录状态...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">请先登录</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">加载站点数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-2">加载失败</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-2">未找到站点信息</p>
          <p className="text-zinc-500 text-sm">当前登录账号未关联站点，请联系管理员分配</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      stationName={data.stationName}
      userName={data.userName}
      region={data.region}
      agentName={data.agentName}
      stats={data.stats}
      recentComplaints={data.recentComplaints}
      revenueData={data.revenueData}
    />
  );
}
