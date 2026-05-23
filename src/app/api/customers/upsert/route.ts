import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, nickname } = body;

    if (!phone) {
      return NextResponse.json({ error: "请提供手机号" }, { status: 400 });
    }

    // 按手机号查找已有客户
    let customer = await prisma.customer.findFirst({ where: { phone } });

    if (!customer) {
      // 找一个可用站点作为默认归属
      const station = await prisma.station.findFirst({
        where: { status: "APPROVED" },
      });
      if (!station) {
        return NextResponse.json({ error: "暂无可用站点" }, { status: 500 });
      }

      customer = await prisma.customer.create({
        data: {
          openid: `sms_${phone}`,
          phone,
          nickname: nickname || `用户${phone.slice(-4)}`,
          stationId: station.id,
        },
      });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Customer upsert error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
