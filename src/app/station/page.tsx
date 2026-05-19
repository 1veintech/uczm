import { prisma } from "@/lib/prisma";
import { COMPLAINT_STATUS_LABELS, PROBLEM_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import DashboardClient from "./dashboard-client";

export default async function StationDashboard() {
  // Find station by the default user email
  const station = await prisma.station.findFirst({
    where: { user: { email: "zhang@ddcm.com" } },
    include: { user: true, agent: { select: { name: true, region: true } } },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch stats
  const [totalComplaints, pendingComplaints, escalatedComplaints, resolvedToday] =
    await Promise.all([
      prisma.complaint.count({ where: { stationId: station.id } }),
      prisma.complaint.count({
        where: { stationId: station.id, status: "PENDING" },
      }),
      prisma.complaint.count({
        where: { stationId: station.id, status: "ESCALATED" },
      }),
      prisma.complaint.count({
        where: {
          stationId: station.id,
          status: "RESOLVED",
          resolvedAt: { gte: today },
        },
      }),
    ]);

  // Fetch recent complaints
  const recentComplaints = await prisma.complaint.findMany({
    where: { stationId: station.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch order stats
  const [todayOrders, monthOrders] = await Promise.all([
    prisma.order.count({
      where: { stationId: station.id, createdAt: { gte: today } },
    }),
    prisma.order.count({
      where: {
        stationId: station.id,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),
  ]);

  // Revenue data for chart (last 7 days)
  const revenueData: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const result = await prisma.order.aggregate({
      where: {
        stationId: station.id,
        status: { in: ["COMPLETED", "SHIPPED"] },
        createdAt: { gte: d, lt: nextD },
      },
      _sum: { totalAmount: true },
    });

    revenueData.push({
      date: format(d, "MM/dd", { locale: zhCN }),
      amount: result._sum.totalAmount ?? 0,
    });
  }

  const savedFines = resolvedToday * 50; // Estimate: each resolved complaint saves ~50 yuan

  return (
    <DashboardClient
      stationName={station.name}
      userName={station.user.name}
      region={station.agent?.region || "未分配"}
      agentName={station.agent?.name || "未分配"}
      stats={{
        totalComplaints,
        pendingComplaints,
        escalatedComplaints,
        savedFines,
        todayOrders,
        monthOrders,
      }}
      recentComplaints={recentComplaints.map((c) => ({
        id: c.id,
        problemType: c.problemType,
        description: c.description,
        status: c.status,
        customerPhone: c.customer.phone,
        createdAt: c.createdAt.toISOString(),
      }))}
      revenueData={revenueData}
    />
  );
}
