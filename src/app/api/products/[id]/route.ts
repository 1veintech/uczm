import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, images, description, price, originalPrice, stock, status } = body;

    // 验证产品是否存在且属于当前站长的站点
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, stationId: true, station: { select: { userId: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "产品不存在" }, { status: 404 });
    }

    if (user!.role === "STATION_MASTER" && product.station.userId !== user!.id) {
      return NextResponse.json({ error: "无权修改该产品" }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (images !== undefined) data.images = images;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (status !== undefined) data.status = status;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireStationMaster();
  if (error) return error;

  try {
    const { id } = await params;

    // 验证产品是否存在且属于当前站长的站点
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, stationId: true, station: { select: { userId: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "产品不存在" }, { status: 404 });
    }

    if (user!.role === "STATION_MASTER" && product.station.userId !== user!.id) {
      return NextResponse.json({ error: "无权删除该产品" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
