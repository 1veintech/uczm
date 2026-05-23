import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireStationMaster();
    if (error) return error;

    const body = await request.json();
    const { name, images, description, price, originalPrice, stock } = body;

    const station = await prisma.station.findUnique({
      where: { userId: user!.id },
    });

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
