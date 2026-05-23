"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import {
  Plus,
  Users,
  Eye,
  Trash2,
  Edit,
  MapPin,
  Phone,
  DollarSign,
  BriefcaseBusiness,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  name: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  requirements: string | null;
  salary: string;
  workLocation: string;
  contactPhone: string | null;
  status: string;
  createdAt: string;
  applications: Application[];
}

interface RecruitmentClientProps {
  jobs: Job[];
}

const STATUS_LABELS: Record<string, string> = {
  HIRING: "招聘中",
  CLOSED: "已关闭",
};

const APP_STATUS_LABELS: Record<string, string> = {
  PENDING: "待处理",
  HIRED: "已录用",
  REJECTED: "已拒绝",
};

export default function RecruitmentClient({ jobs }: RecruitmentClientProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApplicantsDialog, setShowApplicantsDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [statsDialogTitle, setStatsDialogTitle] = useState("");
  const [statsDialogData, setStatsDialogData] = useState<{
    jobs?: Job[];
    applicants?: { name: string; phone: string; jobTitle: string; status: string; createdAt: string }[];
  }>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formRequirements, setFormRequirements] = useState("");
  const [formSalary, setFormSalary] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const handleCreate = async () => {
    if (!formTitle || !formSalary || !formLocation) {
      toast.error("请填写必填字段");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          requirements: formRequirements,
          salary: formSalary,
          workLocation: formLocation,
          contactPhone: formPhone,
        }),
      });
      if (res.ok) {
        toast.success("岗位发布成功");
        setShowCreateDialog(false);
        resetForm();
        window.location.reload();
      } else {
        toast.error("发布失败");
      }
    } catch {
      toast.error("发布失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("确定要删除此岗位吗？")) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("删除成功");
        window.location.reload();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败，请重试");
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormRequirements("");
    setFormSalary("");
    setFormLocation("");
    setFormPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">招聘管理</h1>
          <p className="text-sm text-gray-500 mt-1">发布岗位，管理应聘者</p>
        </div>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          发布岗位
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
          onClick={() => {
            setStatsDialogTitle("在招岗位");
            setStatsDialogData({ jobs: jobs.filter((j) => j.status === "HIRING") });
            setShowStatsDialog(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">在招岗位</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {jobs.filter((j) => j.status === "HIRING").length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
          onClick={() => {
            const allApplicants = jobs.flatMap((j) =>
              j.applications.map((a) => ({
                name: a.name,
                phone: a.phone,
                jobTitle: j.title,
                status: a.status,
                createdAt: a.createdAt,
              })),
            );
            setStatsDialogTitle("总应聘者");
            setStatsDialogData({ applicants: allApplicants });
            setShowStatsDialog(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总应聘人数</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, j) => sum + j.applications.length, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
          onClick={() => {
            const hiredApplicants = jobs.flatMap((j) =>
              j.applications
                .filter((a) => a.status === "HIRED")
                .map((a) => ({
                  name: a.name,
                  phone: a.phone,
                  jobTitle: j.title,
                  status: a.status,
                  createdAt: a.createdAt,
                })),
            );
            setStatsDialogTitle("已录用");
            setStatsDialogData({ applicants: hiredApplicants });
            setShowStatsDialog(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已录用</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {jobs.reduce(
                    (sum, j) =>
                      sum + j.applications.filter((a) => a.status === "HIRED").length,
                    0
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="text-gray-600 font-medium">岗位名称</TableHead>
              <TableHead className="text-gray-600 font-medium">薪资</TableHead>
              <TableHead className="text-gray-600 font-medium">工作地点</TableHead>
              <TableHead className="text-gray-600 font-medium">状态</TableHead>
              <TableHead className="text-gray-600 font-medium">应聘人数</TableHead>
              <TableHead className="text-gray-600 font-medium">发布时间</TableHead>
              <TableHead className="text-gray-600 font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                  暂无岗位，点击"发布岗位"开始招聘
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      {job.requirements && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {job.requirements}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {job.workLocation}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs ${STATUS_COLORS[job.status] ?? ""}`}
                      variant="outline"
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplicantsDialog(true);
                      }}
                    >
                      <Users className="mr-1 h-4 w-4" />
                      {job.applications.length}
                    </Button>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {format(new Date(job.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowApplicantsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create job dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">发布新岗位</DialogTitle>
            <DialogDescription className="text-gray-500">
              填写岗位信息，发布招聘需求
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">岗位名称 *</p>
              <Input
                placeholder="例如：配送员、分拣员"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">岗位要求</p>
              <Textarea
                placeholder="输入岗位要求..."
                value={formRequirements}
                onChange={(e) => setFormRequirements(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">薪资 *</p>
                <Input
                  placeholder="例如：5000-8000"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">工作地点 *</p>
                <Input
                  placeholder="例如：朝阳区"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">联系电话</p>
              <Input
                placeholder="联系人电话"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "发布中..." : "发布岗位"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applicants dialog */}
      <Dialog
        open={showApplicantsDialog}
        onOpenChange={setShowApplicantsDialog}
      >
        <DialogContent className="sm:max-w-lg bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedJob?.title} - 应聘者列表
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              共 {selectedJob?.applications.length ?? 0} 人应聘
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedJob?.applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Users className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">暂无应聘者</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedJob?.applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {app.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs ${STATUS_COLORS[app.status] ?? ""}`}
                        variant="outline"
                      >
                        {APP_STATUS_LABELS[app.status] ?? app.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(app.createdAt), "MM-dd HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats detail dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-lg bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{statsDialogTitle}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {statsDialogData.jobs
                ? `共 ${statsDialogData.jobs.length} 个岗位`
                : `共 ${statsDialogData.applicants?.length ?? 0} 人`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {statsDialogData.jobs ? (
              statsDialogData.jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <BriefcaseBusiness className="h-12 w-12 mb-2 text-gray-300" />
                  <p className="text-sm">暂无在招岗位</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {statsDialogData.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                          <BriefcaseBusiness className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.workLocation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200" variant="outline">
                          {job.salary}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {job.applications.length} 人应聘
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : statsDialogData.applicants?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Users className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">暂无应聘者</p>
              </div>
            ) : (
              <div className="space-y-2">
                {statsDialogData.applicants?.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {app.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-blue-600">{app.jobTitle}</p>
                      <Badge
                        className={`text-xs mt-1 ${STATUS_COLORS[app.status] ?? ""}`}
                        variant="outline"
                      >
                        {APP_STATUS_LABELS[app.status] ?? app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
