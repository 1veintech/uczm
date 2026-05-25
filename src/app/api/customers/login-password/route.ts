import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 客户密码登录限流
const loginRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15分钟

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    // 限流检查
    const now = Date.now();
    const attempt = loginRateLimit.get(phone);
    if (attempt && attempt.resetAt > now && attempt.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: "登录尝试过于频繁，请15分钟后再试" },
        { status: 429 }
      );
    }

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "请输入正确的手机号" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "请输入密码" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({ where: { phone } });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "该手机号未注册" },
        { status: 404 }
      );
    }

    if (!customer.password) {
      return NextResponse.json(
        { success: false, message: "该账号未设置密码，请用验证码登录" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      // 记录失败尝试
      const failAttempt = loginRateLimit.get(phone);
      if (failAttempt && failAttempt.resetAt > now) {
        failAttempt.count++;
      } else {
        loginRateLimit.set(phone, { count: 1, resetAt: now + LOCKOUT_MS });
      }
      return NextResponse.json(
        { success: false, message: "密码错误" },
        { status: 400 }
      );
    }

    // 登录成功，清除限流
    loginRateLimit.delete(phone);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        nickname: customer.nickname || `用户${phone.slice(-4)}`,
        stationId: customer.stationId,
      },
    });
  } catch (error) {
    console.error("Customer password login error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
