"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/lib/api";

interface User {
  userId: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  adminRole?: string;
  employeeId?: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({ email, password });
    const data = res.data.data;
    const userData: User = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      adminRole: data.adminRole,
      employeeId: data.employeeId,
      accessToken: data.accessToken,
    };
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData: any) => {
    const res = await authApi.register(formData);
    const data = res.data.data;
    const userData: User = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accessToken: data.accessToken,
    };
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};