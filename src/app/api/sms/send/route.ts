import { NextRequest, NextResponse } from "next/server";
import { generateCode, saveCode, sendSMS } from "@/lib/sms";

// 限流：每个手机号每分钟最多发送3次
const rateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "请输入正确的手机号" },
        { status: 400 }
      );
    }

    // 限流检查
    const now = Date.now();
    const limit = rateLimit.get(phone);
    if (limit && limit.resetAt > now && limit.count >= 3) {
      return NextResponse.json(
        { success: false, message: "发送过于频繁，请1分钟后再试" },
        { status: 429 }
      );
    }

    // 生成并保存验证码
    const code = generateCode();
    saveCode(phone, code);

    // 更新限流
    rateLimit.set(phone, {
      count: limit && limit.resetAt > now ? limit.count + 1 : 1,
      resetAt: now + 60000,
    });

    // 发送短信
    const sent = await sendSMS(phone, code);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: "验证码已发送",
        // 仅在明确设置的调试模式下返回验证码
        ...(process.env.SMS_DEBUG === "true" && { code }),
      });
    } else {
      return NextResponse.json(
        { success: false, message: "发送失败，请稍后重试" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
