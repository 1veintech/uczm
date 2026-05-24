import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStationMaster } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireStationMaster();
    if (error) return error;

    const body = await request.json();
    const { name, images, description, price, originalPrice, stock } = body;

    const parsedPrice = parseFloat(price);
    if (!name || !parsedPrice || parsedPrice <= 0) {
      return NextResponse.json({ error: "请填写有效的商品名称和价格" }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ error: "商品名称过长" }, { status: 400 });
    }
    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0 || parsedStock > 999999) {
      return NextResponse.json({ error: "库存数量无效" }, { status: 400 });
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
        name: name.trim().slice(0, 200),
        images: images || JSON.stringify([`https://picsum.photos/seed/${Date.now()}/400/400`]),
        description: (description || "").slice(0, 2000),
        price: Math.round(parsedPrice * 100) / 100,
        originalPrice: originalPrice ? Math.round(parseFloat(originalPrice) * 100) / 100 : null,
        stock: parsedStock,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
