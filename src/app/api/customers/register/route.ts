import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyCode } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phone, code, password, nickname } = await request.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "请输入正确的手机号" },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, message: "请输入6位验证码" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "密码长度至少6位" },
        { status: 400 }
      );
    }

    // 验证验证码
    const isValid = verifyCode(phone, code);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "验证码错误或已过期" },
        { status: 400 }
      );
    }

    // 检查是否已注册
    let customer = await prisma.customer.findFirst({ where: { phone } });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (customer) {
      // 已存在，更新密码和昵称
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          password: hashedPassword,
          ...(nickname ? { nickname } : {}),
        },
      });
    } else {
      // 新注册
      const station = await prisma.station.findFirst({
        where: { status: "APPROVED" },
      });
      if (!station) {
        return NextResponse.json(
          { success: false, message: "暂无可用站点，请联系管理员" },
          { status: 500 }
        );
      }

      customer = await prisma.customer.create({
        data: {
          openid: `sms_${phone}`,
          phone,
          password: hashedPassword,
          nickname: nickname || `用户${phone.slice(-4)}`,
          stationId: station.id,
        },
      });
    }

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
    console.error("Customer register error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
