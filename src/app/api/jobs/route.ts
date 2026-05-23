import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const body = await request.json();
    const { title, requirements, salary, workLocation, contactPhone } = body;

    if (!title || !salary || !workLocation) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    // 从认证用户获取站点
    const station = await prisma.station.findUnique({
      where: { userId: user!.id },
    });

    if (!station) {
      return NextResponse.json({ error: "站点不存在" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        stationId: station.id,
        title,
        requirements: requirements || null,
        salary,
        workLocation,
        contactPhone: contactPhone || null,
        status: "HIRING",
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
