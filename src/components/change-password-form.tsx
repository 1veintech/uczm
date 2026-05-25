"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("请填写完整信息");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("新密码长度至少6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次密码输入不一致");
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("新密码不能与旧密码相同");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("密码修改成功");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "修改失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Lock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-white text-lg">修改密码</CardTitle>
            <CardDescription className="text-zinc-400">修改您的登录密码</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-zinc-300">旧密码</Label>
          <div className="relative mt-2">
            <Input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
              className="bg-zinc-800 border-zinc-700 text-zinc-200 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-zinc-300">新密码</Label>
          <div className="relative mt-2">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
              className="bg-zinc-800 border-zinc-700 text-zinc-200 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-zinc-300">确认新密码</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
            className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-200"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {saving ? "保存中..." : <><Save className="h-4 w-4 mr-2" />保存</>}
        </Button>
      </CardContent>
    </Card>
  );
}
