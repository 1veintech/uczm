import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, images, description, price, originalPrice, stock, status } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (images !== undefined) data.images = images;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (status !== undefined) data.status = status;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
