export const APP_NAME = "优采智管私域管理系统";
export const APP_DESCRIPTION = "专为优采智管站长设计的私域经营SaaS系统";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COUNTY_AGENT: "COUNTY_AGENT",
  STATION_MASTER: "STATION_MASTER",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "总管理员",
  COUNTY_AGENT: "区县代理",
  STATION_MASTER: "站长",
};

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  PENDING: "待处理",
  RESOLVED: "已处理",
  ESCALATED: "已升级",
};

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  MISSING: "缺货",
  DAMAGED: "破损",
  WRONG_ITEM: "错送",
  QUALITY: "质量问题",
  OTHER: "其他",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  UNPAID: "待付款",
  PAID: "待发货",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export const STATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  DISABLED: "已停用",
};

export const PLAN_TYPE_LABELS: Record<string, string> = {
  BASIC: "基础版",
  ADVANCED: "高级版",
};

export const WITHDRAWAL_STATUS_LABELS: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  COMPLETED: "已完成",
};

export const RESOLVE_TYPES = [
  { value: "refund", label: "私下补款" },
  { value: "replace", label: "补货" },
  { value: "coupon", label: "下次抵扣" },
  { value: "other", label: "其他" },
];

export const LOGISTICS_COMPANIES = [
  "顺丰速运", "圆通速递", "中通快递", "韵达快递", "申通快递", "极兔速递", "邮政快递", "其他"
];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  ESCALATED: "bg-red-500/20 text-red-400 border-red-500/30",
  UNPAID: "bg-red-500/20 text-red-400 border-red-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SHIPPED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  DISABLED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  HIRING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CLOSED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  HIRED: "bg-green-500/20 text-green-400 border-green-500/30",
};
