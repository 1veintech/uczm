import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: user!.email,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "已通过" : "已拒绝",
    });
  } catch (error) {
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}
