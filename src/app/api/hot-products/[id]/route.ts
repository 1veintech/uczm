import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, imageUrl, price, pddPath, status } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (price !== undefined) data.price = parseFloat(price);
    if (pddPath !== undefined) data.pddPath = pddPath;
    if (status !== undefined) data.status = status;

    const product = await prisma.hotProduct.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update hot product error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.hotProduct.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete hot product error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
