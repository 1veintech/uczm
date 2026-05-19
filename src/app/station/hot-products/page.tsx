import { prisma } from "@/lib/prisma";
import HotProductsClient from "./hot-products-client";

export default async function HotProductsPage() {
  const station = await prisma.station.findFirst({
    where: { user: { email: "zhang@ddcm.com" } },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  const products = await prisma.hotProduct.findMany({
    where: { stationId: station.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <HotProductsClient
      products={products.map((p) => ({
        id: p.id,
        title: p.title,
        imageUrl: p.imageUrl,
        price: p.price,
        pddPath: p.pddPath,
        sortOrder: p.sortOrder,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
