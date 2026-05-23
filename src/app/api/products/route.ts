import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireStationMaster();
    if (error) return error;

    const body = await request.json();
    const { name, images, description, price, originalPrice, stock } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    // 根据认证用户获取站点
    const station = await prisma.station.findUnique({
      where: { userId: user!.id },
    });

    if (!station) {
      return NextResponse.json({ error: "站点不存在" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        stationId: station.id,
        name,
        images: images || JSON.stringify([`https://picsum.photos/seed/${Date.now()}/400/400`]),
        description: description || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
