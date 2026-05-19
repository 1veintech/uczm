import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, logisticsCompany, logisticsNo } = body;

    if (!orderId) return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        logisticsCompany: logisticsCompany || "",
        logisticsNo: logisticsNo || "",
        shipTime: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "发货成功" });
  } catch (error) {
    return NextResponse.json({ error: "发货失败" }, { status: 500 });
  }
}
