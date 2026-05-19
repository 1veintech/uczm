import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import IncomeClient from "./income-client";

export default async function IncomePage() {
  const station = await prisma.station.findFirst({
    where: { user: { email: "zhang@ddcm.com" } },
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
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Fetch order stats
  const [todayOrders, monthOrders, todayRevenue, monthRevenue] = await Promise.all([
    prisma.order.count({
      where: {
        stationId: station.id,
        status: { in: ["COMPLETED", "SHIPPED"] },
        createdAt: { gte: today },
      },
    }),
    prisma.order.count({
      where: {
        stationId: station.id,
        status: { in: ["COMPLETED", "SHIPPED"] },
        createdAt: { gte: monthStart },
      },
    }),
    prisma.order.aggregate({
      where: {
        stationId: station.id,
        status: { in: ["COMPLETED", "SHIPPED"] },
        createdAt: { gte: today },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        stationId: station.id,
        status: { in: ["COMPLETED", "SHIPPED"] },
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  // Revenue data for chart (last 30 days)
  const revenueData: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
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
      date: format(d, "MM/dd"),
      amount: result._sum.totalAmount ?? 0,
    });
  }

  // Fetch withdrawal history
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { stationId: station.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Calculate total withdrawn
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED" || w.status === "APPROVED")
    .reduce((sum, w) => sum + w.amount, 0);

  const totalRevenue = monthRevenue._sum.totalAmount ?? 0;
  const availableBalance = totalRevenue - totalWithdrawn;

  return (
    <IncomeClient
      stats={{
        todayOrders,
        monthOrders,
        todayAmount: todayRevenue._sum.totalAmount ?? 0,
        monthAmount: totalRevenue,
        availableBalance: Math.max(0, availableBalance),
        totalWithdrawn,
      }}
      revenueData={revenueData}
      withdrawals={withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
      }))}
    />
  );
}
