import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ orders: [] });
    }

    const customer = await prisma.customer.findFirst({ where: { phone } });
    if (!customer) {
      return NextResponse.json({ orders: [] });
    }
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toLocaleString("zh-CN"),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
        })),
      })),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { receiverName, receiverPhone, receiverAddress, items } = body;

    if (!receiverName || !receiverPhone || !receiverAddress) {
      return NextResponse.json({ error: "请填写完整的收货信息" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "订单商品不能为空" }, { status: 400 });
    }

    // Find customer by phone
    const customer = await prisma.customer.findFirst({
      where: { phone: receiverPhone },
    });
    if (!customer) {
      return NextResponse.json({ error: "未找到客户信息" }, { status: 400 });
    }

    // 根据认证用户获取站点
    const station = user!.stationId
      ? await prisma.station.findUnique({ where: { id: user!.stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!station) {
      return NextResponse.json({ error: "未找到站点信息" }, { status: 400 });
    }

    // 服务端校验价格和库存（不信任客户端数据）
    const productIds = items.map((item: { productId: string }) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, stationId: station.id, status: "ACTIVE" },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const orderItems: { productId: string; productName: string; productImage: string; price: number; quantity: number; subtotal: number }[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `商品 ${item.productId} 不存在或已下架` }, { status: 400 });
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `商品「${dbProduct.name}」库存不足（剩余 ${dbProduct.stock}）` }, { status: 400 });
      }
      const subtotal = dbProduct.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        productImage: "",
        price: dbProduct.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 扣减库存
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
      });
    }

    const orderNo = `DD${Date.now().toString().slice(-10)}`;

    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        stationId: station.id,
        totalAmount,
        status: "PAID",
        receiverName,
        receiverPhone,
        receiverAddress,
        payTime: new Date(),
        items: {
          create: orderItems,
        },
      },
    });

    return NextResponse.json({ success: true, orderNo: order.orderNo });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "创建订单失败，请稍后重试" }, { status: 500 });
  }
}
