"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { orderApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Package, ChevronRight, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
  }, [user, isLoading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    orderApi.getAll(page, 10).then((r) => {
      setOrders(r.data.data.content);
      setTotalPages(r.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [user, page]);

  const handleCancel = async (orderId: number) => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      await orderApi.cancel(orderId);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "CANCELLED", canCancel: false } : o));
    } catch (err: any) {
      alert(err.response?.data?.message || "Cannot cancel this order");
    } finally {
      setCancelling(null);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="page-title mb-6 flex items-center gap-2">
          <Package size={22} className="text-primary" /> My Orders
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 glass-card">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">Start shopping to see your orders here</p>
            <button onClick={() => router.push("/")} className="btn-primary w-36 mx-auto">Shop Now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.orderId} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{new Date(order.orderDate).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <span key={item.orderItemId} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                      {item.productName} × {item.quantity}
                    </span>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{formatPrice(order.totalAmount)}</span>
                  <div className="flex items-center gap-2">
                    {order.canCancel && (
                      <button onClick={() => handleCancel(order.orderId)}
                        disabled={cancelling === order.orderId}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1">
                        <X size={12} /> {cancelling === order.orderId ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                    <button onClick={() => router.push(`/orders/${order.orderId}`)}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      Details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${i === page ? "bg-primary text-white" : "border border-gray-200 text-gray-600"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}