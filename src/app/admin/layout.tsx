"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, ShoppingBag, CreditCard, LogOut, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }
    if (user.role === "ADMIN" && user.adminRole === "PRODUCT_MANAGER" && !pathname.startsWith("/admin/products")) {
      router.push("/admin/products");
    }
  }, [user, isLoading, pathname, router]);

  const handleLogout = async () => { await logout(); router.push("/auth/signin"); };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["SUPER_ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER", "USER_MANAGER"] },
    { href: "/admin/products", icon: Package, label: "Products", roles: ["SUPER_ADMIN", "PRODUCT_MANAGER"] },
    { href: "/admin/orders", icon: ShoppingBag, label: "Orders", roles: ["SUPER_ADMIN", "ORDER_MANAGER"] },
    { href: "/admin/payments", icon: CreditCard, label: "Payments", roles: ["SUPER_ADMIN", "ORDER_MANAGER"] },
  ].filter(item => !user?.adminRole || item.roles.includes(user.adminRole));

  if (isLoading || !user) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">VC</span>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">VisionCart</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === href ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"}`}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="mb-3 px-3">
          <p className="text-xs font-semibold text-gray-800">{user.name}</p>
          <p className="text-xs text-primary">{user.adminRole?.replace("_", " ")}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-gray-100 flex-col">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">VisionCart Admin</span>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}