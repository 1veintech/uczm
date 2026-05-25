import { ChangePasswordForm } from "@/components/change-password-form";

export default function StationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">个人设置</h1>
        <p className="text-sm text-slate-500 mt-1">管理您的账号安全设置</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
