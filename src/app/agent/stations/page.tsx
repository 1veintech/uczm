import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StationsClient } from "./stations-client";

export const dynamic = "force-dynamic";

export default async function AgentStationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "COUNTY_AGENT" && session.user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">无权访问</p>
      </div>
    );
  }

  const agent = await prisma.agent.findFirst({
    where: { userId: session.user.id },
    select: { id: true, region: true },
  });

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到代理信息</p>
      </div>
    );
  }

  const stations = await prisma.station.findMany({
    where: { agentId: agent.id },
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
    region: agent.region || "未分配",
    createdAt: s.createdAt.toISOString(),
    orders: s._count.orders,
    complaints: s._count.complaints,
  }));

  return <StationsClient stations={data} agentRegion={agent.region || ""} agentId={agent.id} />;
}
