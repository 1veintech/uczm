import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ counts: { UNPAID: 0, PAID: 0, SHIPPED: 0, COMPLETED: 0 } });
    }

    const customer = await prisma.customer.findFirst({ where: { phone } });
    if (!customer) {
      return NextResponse.json({ counts: { UNPAID: 0, PAID: 0, SHIPPED: 0, COMPLETED: 0 } });
    }

    const groups = await prisma.order.groupBy({
      by: ["status"],
      where: { customerId: customer.id },
      _count: true,
    });

    const counts: Record<string, number> = { UNPAID: 0, PAID: 0, SHIPPED: 0, COMPLETED: 0 };
    for (const g of groups) {
      counts[g.status] = g._count;
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Order count error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
