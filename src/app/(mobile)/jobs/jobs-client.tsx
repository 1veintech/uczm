"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface JobItem {
  id: string;
  title: string;
  salary: string;
  workLocation: string;
  workLocationDetail: string;
  requirements: string;
  contactPhone: string;
}

export function JobsClient({ jobs }: { jobs: JobItem[] }) {
  const [user, setUser] = useState<{ nickname: string; phone: string } | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => setUser(parsed));
      } catch {}
    }
  }, []);

  const handleApply = (job: JobItem) => {
    setSelectedJob(job);
    setShowSheet(true);
    setApplied(false);
    setApplyName(user?.nickname || "");
    setApplyPhone(user?.phone || "");
  };

  const handleSubmitApply = async () => {
    if (!applyName.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (!applyPhone.trim() || applyPhone.length < 11) {
      toast.error("请输入正确的手机号");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob?.id,
          name: applyName,
          phone: applyPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "报名失败");
        setApplying(false);
        return;
      }

      setApplying(false);
      setApplied(true);
      toast.success("报名成功，我们会尽快联系您");
    } catch {
      toast.error("网络错误，请稍后重试");
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen mini-premium-bg pb-6">
      <section className="px-4 pt-4">
        <div className="mini-glass-panel-dark overflow-hidden p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/65">LOCAL JOBS</p>
              <h1 className="mt-2 text-2xl font-semibold">站长招聘</h1>
              <p className="mt-2 text-sm leading-5 text-white/72">
                分拣、配送、仓内运营岗位集中发布，报名后站长直接联系。
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/14 backdrop-blur-md">
              <BriefcaseBusiness size={22} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white/12 p-3">
              <p className="text-[11px] text-white/60">在招岗位</p>
              <p className="mt-1 text-lg font-semibold">{jobs.length}</p>
            </div>
            <div className="rounded-lg bg-white/12 p-3">
              <p className="text-[11px] text-white/60">响应</p>
              <p className="mt-1 text-lg font-semibold">当天</p>
            </div>
            <div className="rounded-lg bg-white/12 p-3">
              <p className="text-[11px] text-white/60">服务站</p>
              <p className="mt-1 text-lg font-semibold">直招</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="mini-glass-panel flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">报名信息直达站长后台</p>
            <p className="mt-0.5 text-[11px] text-slate-500">按说明书流程填写姓名和手机号即可投递</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-3">
        <div className="space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="mini-glass-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
                    <BadgeCheck size={12} />
                    服务站直招
                  </div>
                  <h2 className="text-base font-semibold text-slate-950">{job.title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} className="text-blue-400" />
                    {job.workLocationDetail || job.workLocation}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500">
                  {job.salary}
                </span>
              </div>

              {job.requirements && (
                <p className="mt-3 line-clamp-2 rounded-lg bg-white/80 p-3 text-xs leading-5 text-slate-500">
                  {job.requirements}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
                  <Clock3 size={12} />
                  <span className="truncate">工作地点：{job.workLocation}</span>
                </div>
                <button
                  onClick={() => handleApply(job)}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition active:scale-95"
                >
                  <Send size={13} />
                  报名
                </button>
              </div>
            </article>
          ))}

          {jobs.length === 0 && (
            <div className="mini-glass-panel flex flex-col items-center justify-center py-16">
              <BriefcaseBusiness size={42} className="mb-3 text-slate-300" />
              <p className="text-sm text-slate-400">暂无招聘信息</p>
            </div>
          )}
        </div>
      </section>

      {showSheet && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-950/45" onClick={() => setShowSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-lg border border-white/70 bg-white px-5 pb-[max(32px,env(safe-area-inset-bottom))] pt-5 shadow-2xl animate-slide-up">
            <div className="mb-4 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <button
              onClick={() => setShowSheet(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
              aria-label="关闭"
            >
              <X size={17} />
            </button>

            {applied ? (
              <div className="flex flex-col items-center py-6">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-900">报名成功</h3>
                <p className="mt-2 text-center text-sm text-slate-500">
                  {selectedJob?.title} · {selectedJob?.workLocation}
                </p>
                <button
                  onClick={() => setShowSheet(false)}
                  className="mt-5 rounded-lg bg-slate-950 px-8 py-2.5 text-sm font-semibold text-white"
                >
                  知道了
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-blue-600">报名岗位</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedJob?.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedJob?.salary} · {selectedJob?.workLocation}
                </p>

                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    placeholder="您的姓名"
                    className="mini-input w-full px-3 py-3 text-sm placeholder:text-slate-400"
                  />
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="您的手机号"
                      maxLength={11}
                      className="mini-input w-full px-3 py-3 pl-9 text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitApply}
                  disabled={applying}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-60"
                >
                  {applying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交报名"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
