"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/signin");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-primary rounded-full flex items-center justify-center shadow">
              <span className="text-white text-xs font-bold">VC</span>
            </div>
            <span className="text-lg font-bold text-gray-800">VisionCart</span>
          </Link>

          {(!user || user.role === "CUSTOMER") && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="nav-link text-sm">Shop</Link>
              <Link href="/orders" className="nav-link text-sm">My Orders</Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user?.role === "CUSTOMER" && (
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm nav-link">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl">
                  <User size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-700 font-medium">{user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}