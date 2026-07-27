"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { productApi } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Zap, Package, Cuboid, ArrowLeft, Smartphone, Copy, Check, QrCode } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [arModel, setArModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const pid = Number(id);
    Promise.all([
      productApi.getById(pid),
      productApi.getARModel(pid).catch(() => null),
    ]).then(([pRes, arRes]) => {
      setProduct(pRes.data.data);
      if (arRes) setArModel(arRes.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { router.push("/auth/signin"); return; }
    setAdding(true);
    try { await addToCart(product.productId, qty); } finally { setAdding(false); }
  };

  const handleBuyNow = () => {
    if (!user) { router.push("/auth/signin"); return; }
    router.push(`/checkout?productId=${product.productId}&quantity=${qty}`);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-10 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen"><Navbar />
      <div className="text-center py-24"><p className="text-gray-500">Product not found.</p></div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={80} className="text-gray-200" />
                </div>
              )}
            </div>

            {arModel && (
              <div>
                <button
                  onClick={() => setShowAR(!showAR)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  <Cuboid size={18} />
                  {showAR ? "Hide 3D / AR View" : "View in 3D / Augmented Reality"}
                </button>

                <MobileLink productId={product.productId} />

                {showAR && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    {arModel.fileUrl ? (
                      // @ts-ignore — custom element
                      <model-viewer
                        src={arModel.fileUrl}
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        alt={product.name}
                        // @ts-ignore
                        onError={(e) => {
                          console.error("model-viewer failed to load:", arModel.fileUrl, e);
                        }}
                      >
                        <div slot="ar-button" style={{ display: "none" }} />
                        <button
                          slot="ar-button"
                          style={{
                            position: "absolute", bottom: "16px", right: "16px",
                            background: "#F97316", color: "white", border: "none",
                            padding: "10px 20px", borderRadius: "12px", fontWeight: 600,
                            cursor: "pointer", fontSize: "14px",
                          }}
                        >
                          📱 View in Your Room
                        </button>
                      </model-viewer>
                    ) : (
                      <div className="h-[360px] flex items-center justify-center text-gray-400 text-sm">
                        AR model URL missing.
                      </div>
                    )}
                    <ARHint />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-primary font-semibold mb-2">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>

            {arModel && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Cuboid size={12} /> AR Ready — view in your space
              </span>
            )}

            <div className="text-3xl font-bold text-gray-800 mb-1">
              {formatPrice(product.price)}
            </div>

            {product.stockQuantity > 0 ? (
              <p className="text-sm text-green-600 font-medium mb-5">
                ✓ In Stock ({product.stockQuantity} available)
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium mb-5">✗ Out of Stock</p>
            )}

            {product.description && (
              <div className="mb-6">
                <p className="section-label">Description</p>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.stockQuantity > 0 && (
              <div className="mb-6">
                <p className="section-label">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-all font-bold">
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-all font-bold">
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stockQuantity === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all disabled:opacity-40">
                <ShoppingCart size={18} />
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} disabled={product.stockQuantity === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-40">
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ARHint() {
  const [hint, setHint] = useState("Loading 3D model…");
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    if (isIOS || isAndroid) {
      setHint("📱 Tap the orange “View in Your Room” button to place this in your space.");
    } else {
      setHint("🖱️ Drag to rotate · Scroll to zoom · AR mode is available on mobile devices.");
    }
  }, []);
  return <p className="text-xs text-center text-gray-400 py-2 pb-3">{hint}</p>;
}

function MobileLink({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [lanIp, setLanIp] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<{ name: string; ip: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const detectIp = async () => {
    setOpen(true);
    if (lanIp) return;
    // Ask our own Next.js server for the LAN IP. The browser can't see it
    // because public IP-echo services return the WAN IP, which phones on
    // the LAN cannot route back to.
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch("/api/lan-info", { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
      setLanIp(data.lanIp || null);
      if (!data.lanIp) setDetectError("No LAN IP found — is this PC on Wi-Fi/Ethernet?");
    } catch (e: any) {
      setDetectError(`Could not detect LAN IP: ${e?.message || "unknown"}`);
    }
  };

  const mobileUrl = lanIp
    ? `http://${lanIp}:3000/product/${productId}`
    : `${typeof window !== "undefined" ? window.location.origin : ""}/product/${productId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = mobileUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
      document.body.removeChild(ta);
    }
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=2&data=${encodeURIComponent(mobileUrl)}`;

  return (
    <div className="mt-2">
      <button
        onClick={() => (open ? setOpen(false) : detectIp())}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 hover:text-primary border border-gray-200 rounded-xl hover:border-primary/40 transition-all"
      >
        <Smartphone size={15} />
        {open ? "Hide mobile link" : "Open on my phone"}
      </button>

      {open && (
        <div className="mt-2 p-4 bg-white border border-gray-200 rounded-xl">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <QrCode size={13} /> Scan with your phone camera
          </p>
          <div className="flex gap-3 items-start">
            <img
              src={qrSrc}
              alt="QR code to open this product on mobile"
              width={120}
              height={120}
              className="rounded-lg border border-gray-100 bg-white"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Or copy this link:</p>
              <code className="block text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 break-all text-gray-700">
                {mobileUrl}
              </code>
              <button
                onClick={copy}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${copied ? "bg-green-100 text-green-700" : "bg-primary text-white hover:bg-primary-hover"}`}
              >
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy link</>}
              </button>
              {!lanIp && (
                <p className="mt-2 text-[11px] text-orange-600 leading-snug">
                  Could not auto-detect your LAN IP (some networks block IP-echo services).
                  Find it with <code className="bg-orange-50 px-1 rounded">ipconfig</code> on Windows
                  and replace YOUR_LAN_IP above, then reload.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}