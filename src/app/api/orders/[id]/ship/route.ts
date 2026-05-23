import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { logisticsCompany, logisticsNo } = body;

    if (!logisticsCompany || !logisticsNo) {
      return NextResponse.json({ error: "请填写物流信息" }, { status: 400 });
    }

    // 验证订单属于当前站点的订单
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, stationId: true, status: true, station: { select: { userId: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (user!.role === "STATION_MASTER" && order.station.userId !== user!.id) {
      return NextResponse.json({ error: "无权操作该订单" }, { status: 403 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ error: "该订单状态不允许发货" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        logisticsCompany,
        logisticsNo,
        shipTime: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "发货成功" });
  } catch (error) {
    console.error("Ship order error:", error);
    return NextResponse.json({ error: "发货失败" }, { status: 500 });
  }
}
