import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.hotProduct.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, imageUrl, price, pddPath, stationId } = body;

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!station) return NextResponse.json({ error: "站点不存在" }, { status: 400 });

    const count = await prisma.hotProduct.count({ where: { stationId: station.id } });
    if (count >= 20) return NextResponse.json({ error: "最多20个爆品" }, { status: 400 });

    const product = await prisma.hotProduct.create({
      data: {
        stationId: station.id,
        title,
        imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/300/300`,
        price: parseFloat(price),
        pddPath: pddPath || "",
        sortOrder: count + 1,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

    await prisma.hotProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, imageUrl, price, pddPath, status, sortOrder } = body;

    if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (price !== undefined) data.price = parseFloat(price);
    if (pddPath !== undefined) data.pddPath = pddPath;
    if (status !== undefined) data.status = status;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const product = await prisma.hotProduct.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
