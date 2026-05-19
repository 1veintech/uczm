import { prisma } from "@/lib/prisma";
import { AdminStationsClient } from "./stations-client";

export const dynamic = "force-dynamic";

export default async function AdminStationsPage() {
  const [stations, agents] = await Promise.all([
    prisma.station.findMany({
      include: {
        agent: { select: { id: true, name: true, region: true } },
        _count: {
          select: { customers: true, orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agent.findMany({
      select: { id: true, name: true, region: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const data = stations.map((s) => ({
    id: s.id,
    name: s.name,
    agentId: s.agentId,
    agentName: s.agent?.name || "未分配",
    region: s.agent?.region || "",
    phone: s.phone,
    address: s.address,
    planType: s.planType,
    status: s.status,
    customers: s._count.customers,
    orders: s._count.orders,
  }));

  return <AdminStationsClient stations={data} agents={agents} />;
}
