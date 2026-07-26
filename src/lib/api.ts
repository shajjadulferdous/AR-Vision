import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public endpoints that should NEVER trigger the refresh-on-401 flow.
// Listing them here stops the global interceptor from spamming 401 logs for
// anonymous users hitting optional resources like the AR model fetch.
const PUBLIC_PATH_PATTERNS: RegExp[] = [
  /\/api\/auth\/(login|register|refresh)/,
  /\/api\/products\/[^/]+$/,            // GET single product (public browse)
  /\/api\/products\/[^/]+\/ar-model$/,  // GET AR model (public)
  /\/api\/products(\?.*)?$/,            // GET product list (public)
  /\/api\/products\/(search|filter|categories)/,
];

function isPublicPath(url: string = ""): boolean {
  // Strip query string for matching.
  const path = url.split("?")[0];
  return PUBLIC_PATH_PATTERNS.some((re) => re.test(path));
}

let isRefreshing = false;
let hasRedirected = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const reqUrl: string = originalRequest?.url || "";
    const status = error.response?.status;

    // Public endpoints: 401 is expected for guests, don't try to refresh.
    if (status === 401 && isPublicPath(reqUrl)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      // First 401 on this request — try a refresh once.
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
          const newToken = res.data?.data?.accessToken;
          if (!newToken) throw new Error("No token in refresh response");
          sessionStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(originalRequest);
        } catch {
          isRefreshing = false;
          // Refresh failed — wipe credentials and send user to sign in.
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("user");
          if (typeof window !== "undefined" && !hasRedirected) {
            const here = window.location.pathname;
            if (!here.startsWith("/auth/")) {
              hasRedirected = true;
              window.location.href = "/auth/signin?expired=1";
            }
          }
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: any) => api.post("/api/auth/register", data),
  login: (data: any) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  refresh: () => api.post("/api/auth/refresh"),
  createAdmin: (data: any) => api.post("/api/auth/admin/create", data),
};

export const productApi = {
  getAll: (params?: any) => api.get("/api/products", { params }),
  getById: (id: number) => api.get(`/api/products/${id}`),
  search: (keyword: string, page = 0, size = 12) =>
    api.get("/api/products/search", { params: { keyword, page, size } }),
  filter: (params: any) => api.get("/api/products/filter", { params }),
  getCategories: () => api.get("/api/products/categories"),
  getARModel: (productId: number) => api.get(`/api/products/${productId}/ar-model`),
  create: (data: any) => api.post("/api/admin/products", data),
  update: (id: number, data: any) => api.put(`/api/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/products/${id}`),
  updateStock: (id: number, quantity: number) =>
    api.patch(`/api/admin/products/${id}/stock`, null, { params: { quantity } }),
  getLowStock: (threshold = 10) =>
    api.get("/api/admin/products/low-stock", { params: { threshold } }),
  uploadARModel: (productId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/api/admin/products/${productId}/ar-model`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteARModel: (productId: number) =>
    api.delete(`/api/admin/products/${productId}/ar-model`),
};

export const cartApi = {
  get: () => api.get("/api/customer/cart"),
  add: (productId: number, quantity: number) =>
    api.post("/api/customer/cart", { productId, quantity }),
  update: (cartItemId: number, quantity: number) =>
    api.patch(`/api/customer/cart/items/${cartItemId}`, { quantity }),
  remove: (cartItemId: number) =>
    api.delete(`/api/customer/cart/items/${cartItemId}`),
  clear: () => api.delete("/api/customer/cart"),
};

export const orderApi = {
  checkAddress: () => api.get("/api/customer/orders/check-address"),
  fromCart: (data: any) => api.post("/api/customer/orders/from-cart", data),
  direct: (data: any) => api.post("/api/customer/orders/direct", data),
  getAll: (page = 0, size = 10) =>
    api.get("/api/customer/orders", { params: { page, size } }),
  getById: (orderId: number) => api.get(`/api/customer/orders/${orderId}`),
  cancel: (orderId: number) =>
    api.delete(`/api/customer/orders/${orderId}/cancel`),
  adminGetAll: (params?: any) => api.get("/api/admin/orders", { params }),
  adminUpdateStatus: (orderId: number, status: string) =>
    api.patch(`/api/admin/orders/${orderId}/status`, { status }),
  adminGetStats: () => api.get("/api/admin/orders/stats"),
};

export const paymentApi = {
  createIntent: (orderId: number) =>
    api.post(`/api/customer/payments/${orderId}/create-intent`),
  getReceipt: (orderId: number) =>
    api.get(`/api/customer/payments/${orderId}/receipt`),
  refund: (orderId: number, reason: string) =>
    api.post(`/api/customer/payments/${orderId}/refund`, { reason }),
  adminGetAll: (params?: any) => api.get("/api/admin/payments", { params }),
  adminGetStats: () => api.get("/api/admin/payments/stats"),
};

export const dashboardApi = {
  overview: () => api.get("/api/admin/dashboard/overview"),
  salesReport: (from: string, to: string) =>
    api.get("/api/admin/dashboard/sales-report", { params: { from, to } }),
  topProducts: (limit = 10) =>
    api.get("/api/admin/dashboard/top-products", { params: { limit } }),
};