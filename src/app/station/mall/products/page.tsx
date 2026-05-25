import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MallProductsClient from "./mall-products-client";

export default async function MallProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "STATION_MASTER" && session.user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">无权访问</p>
      </div>
    );
  }

  const station = await prisma.station.findFirst({
    where: { userId: session.user.id },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { stationId: station.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MallProductsClient
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        images: p.images,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        salesCount: p.salesCount,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
