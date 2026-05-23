import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, resolveType, resolveRemark, action } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少工单ID" }, { status: 400 });
    }

    // 验证投诉是否存在
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      select: { id: true, stationId: true, status: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: "工单不存在" }, { status: 404 });
    }

    // 站长只能操作自己站点的投诉
    if (user!.role === "STATION_MASTER" && complaint.stationId !== user!.stationId) {
      return NextResponse.json({ error: "无权操作该工单" }, { status: 403 });
    }

    if (complaint.status !== "PENDING") {
      return NextResponse.json({ error: "该工单已处理" }, { status: 400 });
    }

    if (action === "escalate") {
      await prisma.complaint.update({
        where: { id },
        data: { status: "ESCALATED" },
      });
      return NextResponse.json({ success: true, message: "已升级至代理" });
    }

    await prisma.complaint.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolveType: resolveType || "other",
        resolveRemark: resolveRemark || "",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "已处理" });
  } catch (error) {
    console.error("Resolve complaint error:", error);
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }
}
