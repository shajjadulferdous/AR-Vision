"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { ShoppingBag, Package, Users, TrendingUp, AlertTriangle, CreditCard, Cuboid } from "lucide-react";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.overview(),
      dashboardApi.topProducts(5),
    ]).then(([ovRes, tpRes]) => {
      setOverview(ovRes.data.data);
      setTopProducts(tpRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p || 0);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: "Total Revenue", value: formatPrice(overview?.totalRevenue), icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Revenue Today", value: formatPrice(overview?.revenueToday), icon: TrendingUp, color: "text-primary", bg: "bg-orange-50" },
    { label: "Total Orders", value: overview?.totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Pending Orders", value: overview?.pendingOrders, icon: ShoppingBag, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Total Products", value: overview?.totalProducts, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "AR Products", value: overview?.productsWithAR, icon: Cuboid, color: "text-primary", bg: "bg-orange-50" },
    { label: "Customers", value: overview?.totalCustomers, icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "New Today", value: overview?.newCustomersToday, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div>
      <h1 className="page-title mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {overview?.lowStockProducts > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-700">{overview.lowStockProducts} Low Stock</p>
              <p className="text-xs text-orange-500">Products need restocking</p>
            </div>
          </div>
        )}
        {overview?.pendingPayments > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <CreditCard size={20} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-700">{overview.pendingPayments} Pending Payments</p>
              <p className="text-xs text-blue-500">Awaiting confirmation</p>
            </div>
          </div>
        )}
        {overview?.refundRequested > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <CreditCard size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">{overview.refundRequested} Refund Requests</p>
              <p className="text-xs text-red-500">Needs attention</p>
            </div>
          </div>
        )}
      </div>

      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.productName}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{p.totalQuantitySold} sold</p>
                  <p className="text-xs text-green-600">{formatPrice(p.totalRevenue)}</p>
                </div>
                {p.hasArModel && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">AR</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}