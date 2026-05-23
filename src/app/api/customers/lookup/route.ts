import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "请提供手机号" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { phone },
      select: { id: true, phone: true, nickname: true, stationId: true },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Customer lookup error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
