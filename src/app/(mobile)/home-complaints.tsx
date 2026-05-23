"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";

interface ComplaintItem {
  id: string;
  description: string;
  status: string;
}

export function HomeStats({ hotProductCount, hotProductHref }: { hotProductCount: number; hotProductHref: string }) {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [resolvedCount, setResolvedCount] = useState<number | null>(null);
  const [pendingHref, setPendingHref] = useState("/complaint/history?status=PENDING");
  const [resolvedHref, setResolvedHref] = useState("/complaint/history?status=RESOLVED");

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (!saved) return;

    try {
      const user = JSON.parse(saved);
      if (!user?.phone) return;

      Promise.all([
        fetch(`/api/complaints?phone=${user.phone}&status=PENDING`).then((r) => r.json()),
        fetch(`/api/complaints?phone=${user.phone}&status=RESOLVED`).then((r) => r.json()),
      ]).then(([pendingData, resolvedData]) => {
        const pending = pendingData.complaints || [];
        const resolved = resolvedData.complaints || [];
        setPendingCount(pending.length);
        setResolvedCount(resolved.length);
        if (pending[0]) setPendingHref(`/complaint/${pending[0].id}`);
        if (resolved[0]) setResolvedHref(`/complaint/${resolved[0].id}`);
      }).catch(() => {});
    } catch {}
  }, []);

  const items = [
    {
      label: "待处理",
      value: pendingCount,
      color: "text-amber-200",
      href: pendingHref,
    },
    {
      label: "已完成",
      value: resolvedCount,
      color: "text-emerald-200",
      href: resolvedHref,
    },
    {
      label: "爆品",
      value: hotProductCount,
      color: "text-cyan-200",
      href: hotProductHref,
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10 transition hover:bg-white/[0.12] active:scale-[0.98]"
          aria-label={`查看${item.label}详情`}
        >
          <p className="text-[11px] text-slate-300">{item.label}</p>
          <div className="mt-1 flex items-end justify-between gap-1">
            <p className={`text-2xl font-semibold ${item.color}`}>
              {item.value === null ? "-" : item.value}
            </p>
            <ChevronRight className="mb-1 h-3.5 w-3.5 text-white/30 transition group-active:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HomeComplaints() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(saved);
      if (!user?.phone) {
        setLoading(false);
        return;
      }

      fetch(`/api/complaints?phone=${user.phone}&take=3`)
        .then((res) => res.json())
        .then((data) => {
          setComplaints(data.complaints || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="rounded-[20px] bg-slate-50 px-3 py-5 text-center text-xs text-slate-400">
        加载中...
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-[20px] bg-slate-50 px-3 py-5 text-center text-xs text-slate-400">
        当前暂无售后工单
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {complaints.map((complaint) => (
        <Link
          key={complaint.id}
          href={`/complaint/${complaint.id}`}
          className="flex items-center justify-between gap-3 rounded-[20px] bg-slate-50 px-3 py-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} className="text-blue-500" />
              <p className="truncate text-sm font-semibold text-slate-900">
                售后工单
              </p>
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
              {complaint.description}
            </p>
          </div>
          <span
            className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              complaint.status === "RESOLVED"
                ? "bg-emerald-50 text-emerald-600"
                : complaint.status === "ESCALATED"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            {complaint.status === "RESOLVED"
              ? "已处理"
              : complaint.status === "ESCALATED"
                ? "已升级"
                : "待处理"}
          </span>
        </Link>
      ))}
    </div>
  );
}
