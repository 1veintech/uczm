import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireStationMaster();
    if (error) return error;

    const body = await request.json();
    const { title, requirements, salary, workLocation, contactPhone } = body;

    // 从认证用户获取站点
    const station = await prisma.station.findUnique({
      where: { userId: user!.id },
    });

    if (!station) return NextResponse.json({ error: "站点不存在" }, { status: 400 });

    const job = await prisma.job.create({
      data: {
        stationId: station.id,
        title,
        requirements: requirements || "",
        salary,
        workLocation: workLocation || "",
        contactPhone: contactPhone || station.phone,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
