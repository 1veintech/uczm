import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, region, commissionRate } = body;

    if (!name || !phone || !region) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const email = `agent_${Date.now()}@ddcm.com`;
    const password = await bcrypt.hash("agent123", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password,
        role: "COUNTY_AGENT",
      },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name,
        phone,
        region,
        commissionRate: parseFloat(commissionRate) || 0.1,
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
