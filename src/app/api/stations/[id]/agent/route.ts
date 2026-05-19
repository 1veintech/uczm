import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { agentId } = await req.json();

  // Validate station exists
  const station = await prisma.station.findUnique({ where: { id } });
  if (!station) {
    return NextResponse.json({ error: "站点不存在" }, { status: 404 });
  }

  // If agentId is provided, validate agent exists
  if (agentId) {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: "代理不存在" }, { status: 404 });
    }
  }

  const updated = await prisma.station.update({
    where: { id },
    data: { agentId: agentId || null },
    include: {
      agent: { select: { id: true, name: true, region: true } },
    },
  });

  return NextResponse.json({
    success: true,
    station: {
      id: updated.id,
      name: updated.name,
      agentId: updated.agentId,
      agentName: updated.agent?.name || "未分配",
      region: updated.agent?.region || "",
    },
  });
}
