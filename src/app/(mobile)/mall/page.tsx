import { prisma } from "@/lib/prisma";
import { MallClient } from "./mall-client";

function parseImages(imagesStr: string | null | undefined): string[] {
  if (!imagesStr) return [];
  try {
    const parsed = JSON.parse(imagesStr);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export default async function MallPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { salesCount: "desc" },
  });

  const items = products.map((p) => {
    const images = parseImages(p.images);
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: images[0] || `https://picsum.photos/seed/${p.id}/400/400`,
      salesCount: p.salesCount,
      stock: p.stock,
    };
  });

  return <MallClient products={items} />;
}
