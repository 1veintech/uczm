import { prisma } from "@/lib/prisma";
import RegionClient from "./region-client";

export default async function AgentRegionPage() {
  const agent = await prisma.agent.findFirst({
    where: { user: { email: "agent@ddcm.com" } },
    include: {
      stations: {
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
        },
      },
    },
  });

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">未找到代理信息</p>
      </div>
    );
  }

  let parsedBounds: [number, number][] = [];
  try {
    parsedBounds = agent.regionBounds ? JSON.parse(agent.regionBounds) : [];
  } catch {
    parsedBounds = [];
  }

  return (
    <RegionClient
      agentId={agent.id}
      agentName={agent.name}
      region={agent.region}
      centerLat={agent.centerLat ?? 39.9}
      centerLng={agent.centerLng ?? 116.4}
      zoomLevel={agent.zoomLevel ?? 12}
      regionBounds={parsedBounds}
      stations={agent.stations.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        status: s.status,
      }))}
    />
  );
}
