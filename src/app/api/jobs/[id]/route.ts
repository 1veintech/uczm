import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const { id } = await params;

    // 验证职位属于当前站长的站点
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, stationId: true, station: { select: { userId: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: "职位不存在" }, { status: 404 });
    }

    if (user!.role === "STATION_MASTER" && job.station.userId !== user!.id) {
      return NextResponse.json({ error: "无权删除该职位" }, { status: 403 });
    }

    await prisma.jobApplication.deleteMany({ where: { jobId: id } });
    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
