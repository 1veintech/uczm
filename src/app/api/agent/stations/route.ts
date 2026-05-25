import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAgentOrAdmin } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user: currentUser, error } = await requireAgentOrAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || !phone || !address) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
    }

    // 查找当前代理
    const agent = await prisma.agent.findUnique({
      where: { userId: currentUser!.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "未找到代理信息" }, { status: 404 });
    }

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json({ error: "该手机号已注册" }, { status: 400 });
    }

    const email = `station_${phone}@ddcm.com`;
    const password = await bcrypt.hash("123456", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password,
        role: "STATION_MASTER",
      },
    });

    const station = await prisma.station.create({
      data: {
        userId: user.id,
        name,
        phone,
        address,
        agentId: agent.id,
        planType: "BASIC",
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      station,
    });
  } catch (err) {
    console.error("Create station error:", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
