import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: "请输入手机号和验证码" },
        { status: 400 }
      );
    }

    const isValid = verifyCode(phone, code);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "验证成功",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "验证码错误或已过期" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("SMS verify error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
