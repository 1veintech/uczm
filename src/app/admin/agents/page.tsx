import { prisma } from "@/lib/prisma";
import { AdminAgentsClient } from "./agents-client";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const agents = await prisma.agent.findMany({
    include: {
      user: true,
      stations: {
        include: {
          _count: { select: { orders: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = agents.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    region: a.region,
    stationCount: a.stations.length,
    totalSales: a.stations.reduce(
      (sum, s) => sum + s._count.orders * 100,
      0
    ),
    commission: a.stations.reduce(
      (sum, s) => sum + s._count.orders * 100 * a.commissionRate,
      0
    ),
    commissionRate: a.commissionRate,
    status: a.user?.role === "COUNTY_AGENT" ? "ACTIVE" : "SUSPENDED",
    createdAt: a.createdAt.toISOString().split("T")[0],
  }));

  return <AdminAgentsClient agents={data} />;
}
