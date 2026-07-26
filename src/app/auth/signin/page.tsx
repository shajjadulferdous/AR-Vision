"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        if (user.adminRole === "SUPER_ADMIN") router.push("/admin/dashboard");
        else if (user.adminRole === "PRODUCT_MANAGER") router.push("/admin/products");
        else if (user.adminRole === "ORDER_MANAGER") router.push("/admin/orders");
        else router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network")) {
        setError("Cannot reach the server. If you're on mobile, make sure you're on the same Wi-Fi as the PC.");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-primary rounded-full flex items-center justify-center shadow">
            <span className="text-white text-xs font-bold">VC</span>
          </div>
          <span className="text-base font-bold text-gray-700">VisionCart</span>
        </Link>
        <Link href="/auth/signup" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
          Sign Up
        </Link>
      </div>

      <div className="glass-card w-full max-w-md px-8 py-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">VC</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome Back!</h1>
        <p className="text-sm text-gray-500 text-center mb-7">
          Continue your shopping journey with our AR-powered store
        </p>

        <h2 className="text-base font-semibold text-gray-700 text-center mb-5">Sign In</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input-field pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}