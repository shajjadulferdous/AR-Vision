"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(form);
      router.push("/");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network")) {
        setError("Cannot reach the server. If you're on mobile, make sure you're on the same Wi-Fi as the PC.");
      } else {
        setError("Registration failed. Please try again.");
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
        <Link href="/auth/signin" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
          Sign In
        </Link>
      </div>

      <div className="glass-card w-full max-w-md px-8 py-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">VC</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 text-center mb-7">Join VisionCart and shop in AR</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
            <input type="text" name="name" className="input-field" placeholder="Your full name"
              value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input type="email" name="email" className="input-field" placeholder="example@gmail.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone (optional)</label>
            <input type="tel" name="phone" className="input-field" placeholder="01711111111"
              value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} name="password" className="input-field pr-10"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}