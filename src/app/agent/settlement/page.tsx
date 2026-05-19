import { prisma } from "@/lib/prisma";
import { AgentSettlementClient } from "./settlement-client";

export const dynamic = "force-dynamic";

export default async function AgentSettlementPage() {
  const orders = await prisma.order.findMany({
    include: {
      station: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      station: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const salesData = orders.map((o) => ({
    id: o.id,
    stationName: o.station?.name || "未知站点",
    orderNo: o.orderNo,
    amount: o.totalAmount,
    commission: o.totalAmount * 0.1,
    date: o.createdAt.toISOString().split("T")[0],
  }));

  const withdrawalData = withdrawals.map((w) => ({
    id: w.id,
    amount: w.amount,
    status: w.status,
    bankInfo: w.bankInfo || "未设置",
    createdAt: w.createdAt.toISOString().split("T")[0],
  }));

  return <AgentSettlementClient sales={salesData} withdrawals={withdrawalData} />;
}
