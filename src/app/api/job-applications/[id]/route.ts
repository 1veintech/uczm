import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["HIRED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "无效的状态值" }, { status: 400 });
    }

    // 验证申请存在且属于当前站长的岗位
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { select: { stationId: true, station: { select: { userId: true } } } } },
    });

    if (!application) {
      return NextResponse.json({ error: "申请不存在" }, { status: 404 });
    }

    if (user!.role === "STATION_MASTER" && application.job.station.userId !== user!.id) {
      return NextResponse.json({ error: "无权操作该申请" }, { status: 403 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error("Update job application error:", err);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
