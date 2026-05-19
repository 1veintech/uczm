"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  X,
  Loader2,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const router = useRouter();
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
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleApply = (job: JobItem) => {
    if (!user) {
      toast.error("请先登录后再报名");
      router.push("/login");
      return;
    }
    setSelectedJob(job);
    setShowSheet(true);
    setApplied(false);
    setApplyName("");
    setApplyPhone("");
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 active:scale-95 transition-transform">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            招聘信息
          </h1>
        </div>
      </div>

      {/* Login required prompt */}
      {!user && (
        <div className="mx-4 mt-3 bg-blue-50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <LogIn size={18} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">登录后可报名</p>
            <p className="text-xs text-gray-400">登录享受更多服务</p>
          </div>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-medium active:scale-95"
          >
            去登录
          </Link>
        </div>
      )}

      {/* Job List */}
      <div className="px-4 py-3 space-y-2.5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={11} className="text-blue-400" />
                  {job.workLocation}
                </p>
              </div>
              <span className="flex-shrink-0 ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold shadow-sm shadow-blue-500/20">
                {job.salary}
              </span>
            </div>

            {job.requirements && (
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                <Briefcase size={11} className="inline mr-1 text-blue-400" />
                {job.requirements}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                工作地点：{job.workLocationDetail || job.workLocation}
              </p>
              <button
                onClick={() => handleApply(job)}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
              >
                我要报名
              </button>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Briefcase size={40} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">暂无招聘信息</p>
          </div>
        )}
      </div>

      {/* Apply Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSheet(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8 max-w-md mx-auto animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <button
              onClick={() => setShowSheet(false)}
              className="absolute top-4 right-4 p-1 active:scale-95 transition-transform"
            >
              <X size={20} className="text-gray-400" />
            </button>

            {applied ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  报名成功
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {selectedJob?.title} - {selectedJob?.workLocation}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  工作人员会尽快与您联系
                </p>
                <button
                  onClick={() => setShowSheet(false)}
                  className="mt-4 px-8 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  知道了
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  报名 - {selectedJob?.title}
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  {selectedJob?.salary} | {selectedJob?.workLocation}
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    placeholder="您的姓名"
                    className="w-full rounded-xl bg-slate-50 border border-gray-100 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                  <input
                    type="tel"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="您的手机号"
                    maxLength={11}
                    className="w-full rounded-xl bg-slate-50 border border-gray-100 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                </div>

                <button
                  onClick={handleSubmitApply}
                  disabled={applying}
                  className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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

      {/* Slide-up animation */}
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
