import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, amount, bankInfo } = body;

    if (!amount) {
      return NextResponse.json({ error: "请填写提现金额" }, { status: 400 });
    }

    // If stationId not provided, find by default user
    let sid = stationId;
    if (!sid) {
      const station = await prisma.station.findFirst({
        where: { user: { email: "zhang@ddcm.com" } },
      });
      if (!station) {
        return NextResponse.json({ error: "站点不存在" }, { status: 400 });
      }
      sid = station.id;
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        stationId: sid,
        amount: parseFloat(amount),
        bankInfo: bankInfo || "",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "提现申请失败" }, { status: 500 });
  }
}
