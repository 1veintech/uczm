import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ serviceRange: "未登录" });
  }

  const customer = await prisma.customer.findFirst({
    where: { phone },
    include: {
      station: {
        include: {
          agent: { select: { region: true } },
        },
      },
    },
  });

  if (!customer?.station?.agent?.region) {
    return NextResponse.json({ serviceRange: "未分配" });
  }

  return NextResponse.json({ serviceRange: customer.station.agent.region });
}
