import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, images, description, price, originalPrice, stock, stationId } = body;

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!station) return NextResponse.json({ error: "站点不存在" }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        stationId: station.id,
        name,
        images: JSON.stringify(images || []),
        description: description || "",
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
