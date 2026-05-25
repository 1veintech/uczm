import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { phone, oldPassword, newPassword } = await request.json();

    if (!phone || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "请填写完整信息" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "新密码长度至少6位" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({ where: { phone } });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }

    if (!customer.password) {
      return NextResponse.json(
        { success: false, message: "该账号未设置密码，请用验证码登录后设置" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(oldPassword, customer.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "旧密码错误" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "密码修改成功",
    });
  } catch (error) {
    console.error("Customer change password error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
