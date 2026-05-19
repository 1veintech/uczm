import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, requirements, salary, workLocation, contactPhone } = body;

    if (!title || !salary || !workLocation) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    // Find the station by the default user
    const station = await prisma.station.findFirst({
      where: { user: { email: "zhang@ddcm.com" } },
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
