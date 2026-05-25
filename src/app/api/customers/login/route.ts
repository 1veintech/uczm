import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyCode } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

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

    // 验证验证码
    const isValid = verifyCode(phone, code);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "验证码错误或已过期" },
        { status: 400 }
      );
    }

    // 查找或创建客户
    let customer = await prisma.customer.findFirst({ where: { phone } });

    if (!customer) {
      // 自动注册：为未注册用户创建客户记录
      const station = await prisma.station.findFirst({
        where: { status: "APPROVED" },
      });
      if (!station) {
        return NextResponse.json(
          { success: false, message: "暂无可用站点，请联系管理员" },
          { status: 500 }
        );
      }

      const defaultPassword = await bcrypt.hash("123456", 10);
      customer = await prisma.customer.create({
        data: {
          openid: `sms_${phone}`,
          phone,
          password: defaultPassword,
          nickname: `用户${phone.slice(-4)}`,
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
    console.error("Customer login error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
