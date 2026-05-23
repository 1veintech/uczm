import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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

    const email = `agent_${crypto.randomUUID().slice(0, 8)}@ddcm.com`;
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const password = await bcrypt.hash(tempPassword, 10);

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
      // 返回临时密码，由管理员通过安全渠道告知代理
      tempPassword,
    });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
