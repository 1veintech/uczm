import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const images = parseImages(product.images);
  const fallbackImage = `https://picsum.photos/seed/${product.id}/600/600`;

  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    images: images.length > 0 ? images : [fallbackImage],
    description: product.description || "",
    stock: product.stock,
    salesCount: product.salesCount,
  };

  return <ProductDetailClient product={productData} />;
}
