import { prisma } from "@/lib/prisma";
import { AgentComplaintsClient } from "./complaints-client";

export const dynamic = "force-dynamic";

export default async function AgentComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    include: {
      station: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = complaints.map((c) => ({
    id: c.id,
    stationName: c.station?.name || "未知站点",
    problemType: c.problemType,
    description: c.description,
    status: c.status,
    createdAt: c.createdAt.toISOString().replace("T", " ").slice(0, 16),
    images: c.images ? JSON.parse(c.images) : [],
    resolveType: c.resolveType,
    resolveRemark: c.resolveRemark,
  }));

  return <AgentComplaintsClient complaints={data} />;
}
