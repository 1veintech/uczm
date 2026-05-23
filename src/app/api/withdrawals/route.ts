import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthUser();
    if (error) return error;

    const body = await request.json();
    const { amount, bankInfo } = body;

    if (!amount) {
      return NextResponse.json({ error: "请填写提现金额" }, { status: 400 });
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
