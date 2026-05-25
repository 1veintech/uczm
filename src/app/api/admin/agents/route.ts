import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user: adminUser, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, phone, region, commissionRate } = body;

    if (!name || !phone || !region) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const email = `agent_${phone}@ddcm.com`;
    const password = await bcrypt.hash("123456", 10);

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

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
