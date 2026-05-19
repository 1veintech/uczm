import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, stationId } = await req.json();

    if (!phone || !stationId) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // Validate station exists and is approved
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { agent: { select: { name: true, region: true } } },
    });

    if (!station || station.status !== "APPROVED") {
      return NextResponse.json({ error: "该站点不存在或未启用" }, { status: 400 });
    }

    // Find or create customer
    const openid = `wx_${phone}_${Date.now()}`;
    let customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (customer) {
      // Update existing customer's station binding
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          stationId,
          openid, // update openid if changed
        },
      });
    } else {
      // Create new customer bound to this station
      customer = await prisma.customer.create({
        data: {
          openid,
          phone,
          nickname: `用户${phone.slice(-4)}`,
          stationId,
        },
      });
    }

    // Save user info to localStorage on client side (return data)
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        nickname: customer.nickname,
        phone: customer.phone,
        stationId: customer.stationId,
        stationName: station.name,
        region: station.agent?.region || "",
      },
    });
  } catch (error) {
    console.error("Bind customer error:", error);
    return NextResponse.json({ error: "绑定失败，请重试" }, { status: 500 });
  }
}
