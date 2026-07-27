"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { orderApi, productApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { MapPin, CheckCircle, AlertCircle } from "lucide-react";

export default function CheckoutClient() {
  const { user, isLoading } = useAuth();
  const { cart, refreshCart } = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const directProductId = params.get("productId");
  const directQty = params.get("quantity");

  const [addressCheck, setAddressCheck] = useState<any>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState({ division: "", zilla: "", upazilla: "", detailAddress: "" });
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
  }, [user, isLoading]);

  useEffect(() => {
    orderApi.checkAddress().then((r) => {
      setAddressCheck(r.data.data);
      setUseNewAddress(!r.data.data.hasAddress);
    }).catch(() => {});

    if (directProductId) {
      productApi.getById(Number(directProductId)).then((r) => setProduct(r.data.data)).catch(() => {});
    }
  }, [directProductId]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  const totalAmount = directProductId && product
    ? product.price * Number(directQty || 1)
    : cart?.totalAmount || 0;

  const handlePlaceOrder = async () => {
    if (useNewAddress && (!address.division || !address.zilla || !address.upazilla)) {
      setError("Please fill in all address fields."); return;
    }
    setError("");
    setLoading(true);
    try {
      let res;
      const shippingAddress = useNewAddress ? address : null;
      if (directProductId) {
        res = await orderApi.direct({
          productId: Number(directProductId),
          quantity: Number(directQty || 1),
          shippingAddress,
          updateSavedAddress: useNewAddress && saveAddress,
          contactNumber,
        });
      } else {
        res = await orderApi.fromCart({
          shippingAddress,
          updateSavedAddress: useNewAddress && saveAddress,
          contactNumber,
        });
      }
      const orderId = res.data.data.orderId;
      await refreshCart();
      router.push(`/payment/${orderId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen"><Navbar /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="page-title mb-6">Checkout</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
            {directProductId && product ? (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{product.name} × {directQty || 1}</span>
                <span className="font-semibold text-gray-800">{formatPrice(totalAmount)}</span>
              </div>
            ) : (
              <div className="space-y-1">
                {cart?.items?.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-sm text-gray-600">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> Shipping Address
            </h2>

            {addressCheck?.hasAddress && (
              <div className="mb-4">
                <div
                  onClick={() => setUseNewAddress(false)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all mb-3 ${!useNewAddress ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={14} className={!useNewAddress ? "text-primary" : "text-gray-300"} />
                    <span className="text-sm font-semibold text-gray-700">Use saved address</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-5">
                    {addressCheck.savedAddress?.detailAddress}, {addressCheck.savedAddress?.upazilla},{" "}
                    {addressCheck.savedAddress?.zilla}, {addressCheck.savedAddress?.division}
                  </p>
                </div>
                <button onClick={() => setUseNewAddress(true)} className="text-sm text-primary hover:underline">
                  + Use a different address
                </button>
              </div>
            )}

            {(useNewAddress || !addressCheck?.hasAddress) && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {["division", "zilla", "upazilla"].map((field) => (
                    <div key={field}>
                      <label className="text-xs text-gray-500 font-medium mb-1 block capitalize">{field}</label>
                      <input type="text" className="input-field py-2 text-sm" placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(address as any)[field]}
                        onChange={(e) => setAddress(p => ({ ...p, [field]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Detail Address</label>
                  <input type="text" className="input-field py-2 text-sm" placeholder="House, Road, Area..."
                    value={address.detailAddress}
                    onChange={(e) => setAddress(p => ({ ...p, detailAddress: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 accent-primary" />
                  Save this address for future orders
                </label>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Contact Number</h2>
            <input type="tel" className="input-field" placeholder="01711111111 (optional — uses profile phone if empty)"
              value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
          </div>

          <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary">
            {loading ? "Placing Order..." : "Place Order & Continue to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
