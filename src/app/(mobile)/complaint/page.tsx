"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, Loader2, CheckCircle2, LogIn, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const problemTypes = [
  { value: "MISSING", label: "缺货" },
  { value: "DAMAGED", label: "破损" },
  { value: "WRONG_ITEM", label: "错送" },
  { value: "QUALITY", label: "质量问题" },
  { value: "OTHER", label: "其他" },
];

export default function ComplaintPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ nickname: string; phone: string } | null>(null);
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 清理预览 URL 防止内存泄漏
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => setUser(parsed));
      } catch {}
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (imageFiles.length >= 4) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片大小不能超过5MB");
        return;
      }
      // 用 object URL 做预览（不轉 base64）
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => {
        if (prev.length >= 4) return prev;
        return [...prev, previewUrl];
      });
      setImageFiles((prev) => {
        if (prev.length >= 4) return prev;
        return [...prev, file];
      });
    });
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    // 释放 object URL
    const url = imagePreviews[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录后再提交");
      router.push("/home");
      return;
    }
    if (!problemType) {
      toast.error("请选择问题类型");
      return;
    }
    if (!description.trim()) {
      toast.error("请填写问题描述");
      return;
    }

    setSubmitting(true);
    try {
      // 先根据手机号查找客户ID，不存在则自动创建
      const lookupRes = await fetch(`/api/customers/lookup?phone=${user.phone}`);
      const lookupData = await lookupRes.json();
      let customerId = lookupData.customer?.id;
      if (!customerId) {
        const createRes = await fetch("/api/customers/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: user.phone, nickname: user.nickname }),
        });
        const createData = await createRes.json();
        if (!createData.customer?.id) {
          toast.error("账户创建失败，请重新登录");
          setSubmitting(false);
          return;
        }
        customerId = createData.customer.id;
      }

      // 先上传图片到服务器获得 URL
      const uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => uploadFormData.append("files", file));
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.urls) {
          uploadedUrls.push(...uploadData.urls);
        }
        if (uploadData.errors?.length > 0) {
          toast.warning(`部分图片上传失败: ${uploadData.errors.join(", ")}`);
        }
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemType,
          description,
          orderNo: orderNo || undefined,
          images: uploadedUrls,
          customerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "提交失败");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
      toast.success("提交成功，我们会尽快处理");
    } catch {
      toast.error("网络错误，请稍后重试");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 mini-page">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">提交成功</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          我们已收到您的反馈，会尽快为您处理
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setProblemType("");
              setDescription("");
              setOrderNo("");
              // 清理预览 URL
              imagePreviews.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
              });
              setImageFiles([]);
              setImagePreviews([]);
            }}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 active:bg-gray-50 transition-colors"
          >
            继续反馈
          </button>
          <Link
            href={`/complaint/history?phone=${user?.phone || ""}`}
            className="px-5 py-2.5 mini-primary text-white text-sm font-medium shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
          >
            查看售后记录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mini-page">
      {/* Header */}
      <div className="sticky top-0 z-40 mini-topbar">
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="p-1 -ml-1 active:scale-95 transition-transform">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            售后报损
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Login required prompt */}
        {!user && (
          <div className="mini-card p-6  text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <LogIn size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">请先登录</p>
            <p className="text-xs text-gray-400 mb-4">登录后即可提交售后反馈</p>
            <Link
              href="/home"
              className="inline-block px-8 py-2.5 mini-primary text-white text-sm font-medium shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
            >
              去登录
            </Link>
          </div>
        )}
        {/* Problem Type */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            问题类型 <span className="text-red-400">*</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {problemTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setProblemType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  problemType === type.value
                    ? "mini-primary text-white shadow-sm shadow-blue-500/20"
                    : "mini-secondary text-gray-600 hover:bg-slate-100"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            问题描述 <span className="text-red-400">*</span>
          </h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述您遇到的问题..."
            rows={4}
            className="w-full rounded-lg mini-input px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Image Upload */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            上传图片 <span className="text-gray-400 font-normal">(最多4张)</span>
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            手机可拍照或从相册选择，电脑可选择本地图片
          </p>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((img, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 4 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors cursor-pointer">
                <Camera size={18} />
                <span className="text-[10px]">点击上传</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Order Number */}
        <div className="mini-card p-4 ">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            订单号 <span className="text-gray-400 font-normal">(选填)</span>
          </h3>
          <input
            type="text"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="请输入相关订单号"
            className="w-full rounded-lg mini-input px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Submit Button - only show when logged in */}
        {user && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-lg mini-primary text-white font-semibold text-base shadow-lg shadow-blue-500/25 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                提交中...
              </>
            ) : (
              "提交反馈"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
