"use client";

import { useState } from "react";
import { Search, ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  salesCount: number;
  stock: number;
}

const categories = [
  { key: "all", label: "推荐" },
  { key: "fruit", label: "水果" },
  { key: "vegetable", label: "蔬菜" },
  { key: "meat", label: "肉禽" },
  { key: "seafood", label: "水产" },
  { key: "snack", label: "零食" },
  { key: "drink", label: "饮料" },
];

export function MallClient({ products }: { products: ProductItem[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const addItem = useCart((s) => s.addItem);
  const total = useCart((s) => s.getTotal());
  const itemCount = useCart((s) => s.getItemCount());

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleAddToCart = (product: ProductItem) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Bar - mini-program style */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 pt-3 pb-0 border-b border-gray-100">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索商品..."
            className="w-full h-10 rounded-full bg-slate-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-all rounded-t-lg relative ${
                activeCategory === cat.key
                  ? "text-blue-600 bg-blue-50/80"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat.label}
              {activeCategory === cat.key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Waterfall Product Grid */}
      <div className="px-3 py-3" style={{ columnCount: 2, columnGap: "0.75rem" }}>
        {filtered.map((product) => (
          <div
            key={product.id}
            className="mb-3 break-inside-avoid bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50 active:scale-[0.98] transition-transform"
          >
            <Link href={`/mall/${product.id}`} className="block">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full object-cover rounded-t-2xl"
                />
                {product.originalPrice != null && product.originalPrice > product.price && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </Link>
            <div className="p-2.5">
              <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug mb-2 min-h-[32px]">
                {product.name}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-base font-bold text-blue-600">
                    <span className="text-[10px]">¥</span>{product.price.toFixed(1)}
                  </span>
                  {product.originalPrice != null && product.originalPrice > product.price && (
                    <span className="text-[10px] text-gray-400 line-through ml-1">
                      ¥{product.originalPrice.toFixed(1)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center active:scale-90 transition-transform shadow-sm shadow-blue-500/20"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                已售{product.salesCount > 1000 ? `${(product.salesCount / 1000).toFixed(1)}k` : product.salesCount}件
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Search size={40} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">没有找到相关商品</p>
        </div>
      )}

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full pl-4 pr-5 py-2.5 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
        >
          <ShoppingCart size={18} />
          <span className="text-sm font-bold">¥{total.toFixed(2)}</span>
        </Link>
      )}
    </div>
  );
}
