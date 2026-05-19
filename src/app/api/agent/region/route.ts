import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 获取代理的区域边界信息
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      // Return all agents with region info for admin overview
      const agents = await prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          region: true,
          regionBounds: true,
          centerLat: true,
          centerLng: true,
          zoomLevel: true,
          status: true,
          _count: { select: { stations: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ agents });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        region: true,
        regionBounds: true,
        centerLat: true,
        centerLng: true,
        zoomLevel: true,
        status: true,
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
      return NextResponse.json({ error: "代理不存在" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Get agent region error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// POST - 保存代理的区域边界
export async function POST(req: NextRequest) {
  try {
    const { agentId, regionBounds, centerLat, centerLng, zoomLevel } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: "缺少代理ID" }, { status: 400 });
    }

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        regionBounds: JSON.stringify(regionBounds || []),
        centerLat: centerLat || 39.9,
        centerLng: centerLng || 116.4,
        zoomLevel: zoomLevel || 12,
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Save agent region error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
