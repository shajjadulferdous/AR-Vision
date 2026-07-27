"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, Cuboid, Package, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  product: {
    productId: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    stockQuantity: number;
    imageUrl?: string;
    hasArModel: boolean;
    arModelUrl?: string;
    averageRating?: number;
    reviewCount?: number;
    ratingCount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push("/auth/signin"); return; }
    setAdding(true);
    try { await addToCart(product.productId, 1); } finally { setAdding(false); }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(price);

  const averageRating = Number(product.averageRating ?? 0);
  const reviewCount = Number(product.reviewCount ?? product.ratingCount ?? 0);

  return (
    <div className="product-card group">
      <Link href={`/product/${product.productId}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-gray-200" />
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.hasArModel && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Cuboid size={10} /> AR
              </span>
            )}
            {product.stockQuantity === 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Eye size={12} /> View Details
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          )}
          {(averageRating > 0 || reviewCount > 0) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              <span className="font-medium text-gray-700">{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
              <span>({reviewCount || "0"})</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-800">{formatPrice(product.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || adding}
              className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <p className="text-xs text-orange-500 font-medium mt-1">Only {product.stockQuantity} left!</p>
          )}
        </div>
      </Link>
    </div>
  );
}