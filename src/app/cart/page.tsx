"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { user, isLoading } = useAuth();
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
  }, [user, isLoading]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  if (isLoading) return <div className="min-h-screen"><Navbar /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="page-title mb-6 flex items-center gap-2">
          <ShoppingBag size={22} className="text-primary" /> Shopping Cart
          {cart?.totalItems ? <span className="text-sm font-normal text-gray-400">({cart.totalItems} items)</span> : null}
        </h1>

        {!cart?.items?.length ? (
          <div className="text-center py-24 glass-card">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-400 mb-6">Add some products to get started</p>
            <Link href="/" className="btn-primary w-40 mx-auto flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="glass-card p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-gray-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary font-medium">{item.category}</p>
                    <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{formatPrice(item.unitPrice)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateItem(item.cartItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary text-sm font-bold transition-all">
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary text-sm font-bold transition-all disabled:opacity-30">
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.cartItemId)}
                        className="text-red-400 hover:text-red-600 transition-colors ml-auto">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}

              <button onClick={() => clearCart()} className="text-sm text-red-400 hover:text-red-600 transition-colors">
                Clear all items
              </button>
            </div>

            <div className="glass-card p-6 h-fit sticky top-20">
              <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.totalQuantity} items)</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <Link href="/" className="block text-center text-sm text-primary hover:underline mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}