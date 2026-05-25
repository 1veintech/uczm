"use client";

import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  description: string;
  stock: number;
  salesCount: number;
}

export function ProductDetailClient({ product }: { product: ProductData }) {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || `https://picsum.photos/seed/${product.id}/600/600`,
        stock: product.stock,
      },
      quantity
    );
    toast.success("已加入购物车");
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || `https://picsum.photos/seed/${product.id}/600/600`,
        stock: product.stock,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen mini-page pb-24">
      {/* Image Carousel */}
      <div className="relative bg-white">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${currentImage * 100}%)` }}
          >
            {product.images.map((img, i) => (
              <div key={i} className="w-full flex-shrink-0 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImage ? "w-5 bg-blue-500" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="mini-card mx-3 mt-3 px-4 py-3.5">
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-blue-600">
            <span className="text-sm">¥</span>{product.price.toFixed(2)}
          </span>
          {product.originalPrice != null && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through mb-0.5">
              ¥{product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.originalPrice != null && product.originalPrice > product.price && (
            <span className="mb-0.5 ml-auto text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
              省¥{(product.originalPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>
        <h1 className="text-base font-semibold text-gray-800 mt-2.5 leading-snug">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>销量 {product.salesCount}</span>
          <span>库存 {product.stock}</span>
          <span className="flex items-center gap-0.5">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            4.9
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mini-card mx-3 mt-3 px-4 py-3.5">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          商品详情
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {product.description || "暂无商品详情"}
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="mini-card mx-3 mt-3 flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-gray-700">购买数量</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
          >
            <Minus size={14} className="text-gray-600" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-gray-800">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
          >
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-50 mini-bottom-bar px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex flex-col items-center justify-center w-12"
          >
            <ShoppingCart size={22} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 mt-0.5">购物车</span>
          </Link>
          <button
            onClick={handleAddToCart}
            className="mini-secondary flex-1 py-3 text-sm font-semibold active:scale-[0.98]"
          >
            加入购物车
          </button>
          <button
            onClick={handleBuyNow}
            className="mini-primary flex-1 py-3 text-sm font-semibold"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
}
