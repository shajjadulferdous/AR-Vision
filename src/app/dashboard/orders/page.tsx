"use client";
import { useEffect, useState } from "react";
import { orderApi } from "@/lib/api";
import { Search } from "lucide-react";

const STATUS_OPTIONS = ["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.adminGetAll({ keyword: keyword || undefined, status: statusFilter || undefined, page, size: 20 });
      setOrders(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [keyword, statusFilter, page]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await orderApi.adminUpdateStatus(orderId, status);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <h1 className="page-title mb-6">Order Management</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="input-field pl-9 py-2.5 text-sm" placeholder="Search by customer, order number..."
            value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(0); }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="input-field py-2.5 text-sm w-auto">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Order", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-700">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {NEXT_STATUS[order.status]?.length > 0 && (
                        <select
                          onChange={(e) => e.target.value && handleStatusUpdate(order.orderId, e.target.value)}
                          disabled={updating === order.orderId}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:border-primary"
                          defaultValue=""
                        >
                          <option value="">Update →</option>
                          {NEXT_STATUS[order.status].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-xl text-sm font-medium ${i === page ? "bg-primary text-white" : "border border-gray-200 text-gray-600"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}