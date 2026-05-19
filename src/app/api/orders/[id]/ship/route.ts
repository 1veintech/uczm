import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { logisticsCompany, logisticsNo } = body;

    if (!logisticsCompany || !logisticsNo) {
      return NextResponse.json({ error: "请填写物流信息" }, { status: 400 });
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
