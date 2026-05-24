import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthUser();
    if (error) return error;

    const body = await request.json();
    const { amount, bankInfo } = body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || parsedAmount > 100000) {
      return NextResponse.json({ error: "请填写有效的提现金额（0-100000元）" }, { status: 400 });
    }

    // 从认证用户获取站长绑定的站点
    const station = await prisma.station.findUnique({
      where: { userId: user!.id },
    });
    if (!station) {
      return NextResponse.json({ error: "站点不存在" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        stationId: station.id,
        amount: Math.round(parsedAmount * 100) / 100,
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
