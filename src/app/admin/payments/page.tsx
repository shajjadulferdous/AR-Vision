"use client";
import { useEffect, useState } from "react";
import { paymentApi } from "@/lib/api";

const STATUS_OPTIONS = ["", "PENDING", "COMPLETED", "FAILED", "REFUNDED", "REFUND_REQUESTED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
  REFUND_REQUESTED: "bg-orange-100 text-orange-700",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi.adminGetStats().then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    paymentApi.adminGetAll({ status: statusFilter || undefined, page, size: 20 })
      .then((r) => { setPayments(r.data.data.content); setTotalPages(r.data.data.totalPages); })
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p || 0);

  return (
    <div>
      <h1 className="page-title mb-6">Payment Management</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total Revenue", value: formatPrice(stats.totalRevenue), color: "text-green-600" },
            { label: "Completed", value: stats.completedPayments, color: "text-green-500" },
            { label: "Pending", value: stats.pendingPayments, color: "text-yellow-500" },
            { label: "Failed", value: stats.failedPayments, color: "text-red-500" },
            { label: "Refunded", value: stats.refundedPayments, color: "text-gray-500" },
            { label: "Refund Req.", value: stats.refundRequested, color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="input-field py-2.5 text-sm w-auto">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Order", "Amount", "Method", "Status", "Transaction ID", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{p.orderNumber}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.method}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400 max-w-[140px] truncate">
                      {p.transactionId || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.paymentDate).toLocaleDateString()}
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