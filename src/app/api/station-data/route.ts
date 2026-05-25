import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = session.user as any;
  const station = await prisma.station.findUnique({
    where: { userId: currentUser.id },
    include: { user: true, agent: { select: { name: true, region: true } } },
  });

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const recentComplaints = await prisma.complaint.findMany({
    where: { stationId: station.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

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

    const { format } = await import("date-fns");
    const { zhCN } = await import("date-fns/locale");

    revenueData.push({
      date: format(d, "MM/dd", { locale: zhCN }),
      amount: result._sum.totalAmount ?? 0,
    });
  }

  const savedFines = resolvedToday * 50;

  return NextResponse.json({
    stationName: station.name,
    userName: station.user.name,
    region: station.agent?.region || "未分配",
    agentName: station.agent?.name || "未分配",
    stats: {
      totalComplaints,
      pendingComplaints,
      escalatedComplaints,
      savedFines,
      todayOrders,
      monthOrders,
    },
    recentComplaints: recentComplaints.map((c) => ({
      id: c.id,
      problemType: c.problemType,
      description: c.description,
      status: c.status,
      customerPhone: c.customer.phone,
      createdAt: c.createdAt.toISOString(),
    })),
    revenueData,
  });
}
