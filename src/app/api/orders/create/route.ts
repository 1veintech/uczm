import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthUser();
    if (error) return error;

    const body = await request.json();
    const { items, receiverName, receiverPhone, receiverAddress, stationId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "订单无商品" }, { status: 400 });
    }

    // 根据收货手机号查找或创建客户
    let customer = null;
    if (receiverPhone) {
      customer = await prisma.customer.findFirst({
        where: { phone: receiverPhone },
      });
    }
    if (!customer) {
      return NextResponse.json({ error: "未找到客户信息" }, { status: 400 });
    }
    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!customer || !station) {
      return NextResponse.json({ error: "客户或站点不存在" }, { status: 400 });
    }

    const orderNo = `ORD${Date.now()}`;
    // 服务端校验价格和库存
    const productIds = items.map((item: any) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const createOrderItems: any[] = [];
    let totalAmount = 0;
    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `商品 ${item.productId} 不存在或已下架` }, { status: 400 });
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `商品「${dbProduct.name}」库存不足` }, { status: 400 });
      }
      const subtotal = dbProduct.price * item.quantity;
      totalAmount += subtotal;
      createOrderItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        productImage: item.image || "",
        price: dbProduct.price,
        quantity: item.quantity,
        subtotal,
      });
    }
    for (const item of createOrderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        stationId: station.id,
        totalAmount,
        status: "PAID",
        receiverName: receiverName || customer.nickname || "客户",
        receiverPhone: receiverPhone || customer.phone,
        receiverAddress: receiverAddress || "默认地址",
        payTime: new Date(),
        items: {
          create: createOrderItems,
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "下单失败" }, { status: 500 });
  }
}
