import { prisma } from "@/lib/prisma";
import { StationsClient } from "./stations-client";

export const dynamic = "force-dynamic";

export default async function AgentStationsPage() {
  // Filter stations by agent's region
  const agent = await prisma.agent.findFirst({
    where: { user: { email: "agent@ddcm.com" } },
    select: { id: true, region: true },
  });

  const stations = await prisma.station.findMany({
    where: agent ? { agentId: agent.id } : {},
    include: {
      user: true,
      _count: {
        select: {
          complaints: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = stations.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    address: s.address,
    planType: s.planType,
    status: s.status,
    region: agent?.region || "未分配",
    createdAt: s.createdAt.toISOString(),
    orders: s._count.orders,
    complaints: s._count.complaints,
  }));

  return <StationsClient stations={data} agentRegion={agent?.region || ""} agentId={agent?.id} />;
}
