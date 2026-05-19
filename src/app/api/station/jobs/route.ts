import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, requirements, salary, workLocation, contactPhone, stationId } = body;

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

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
