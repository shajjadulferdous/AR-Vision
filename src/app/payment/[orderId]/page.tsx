"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { paymentApi } from "@/lib/api";
import { CheckCircle, CreditCard, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [intent, setIntent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    paymentApi.createIntent(Number(orderId))
      .then((r) => setIntent(r.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to initialize payment"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="text-center py-24"><p className="text-gray-500">Initializing payment...</p></div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="glass-card p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">Your order has been confirmed and is being processed.</p>
          <button onClick={() => router.push("/orders")} className="btn-primary">View My Orders</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Complete Payment</h1>
              <p className="text-sm text-gray-500">Secure checkout via Stripe</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {intent && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Order #{orderId}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatPrice(intent.orderTotal)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-blue-700 mb-2">🧪 Test Mode — Use these card details:</p>
                <div className="space-y-1 text-xs text-blue-600 font-mono">
                  <p>Card: 4242 4242 4242 4242</p>
                  <p>Expiry: 12/28 &nbsp; CVC: 123</p>
                  <p>ZIP: Any (e.g. 10001)</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-mono break-all">
                  <span className="text-gray-400">Payment Intent: </span>{intent.paymentIntentId}
                </p>
              </div>

              <p className="text-xs text-gray-400 text-center mb-5">
                In production, the Stripe card form appears here. For testing, use the Stripe Dashboard or CLI to confirm the payment intent above.
              </p>

              <button
                onClick={() => setSuccess(true)}
                className="btn-primary"
              >
                Simulate Payment Success (Dev)
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                Your order is saved. Payment can be completed anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}