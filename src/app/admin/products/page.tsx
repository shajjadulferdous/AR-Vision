"use client";
import { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import { Plus, Edit2, Trash2, Upload, Package, Search } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stockQuantity: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ page, size: 20, sortBy: "createdAt", sortDir: "desc" });
      setProducts(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load products";
      // 401 is handled by the global interceptor (redirect to /auth/signin).
      if (err.response?.status !== 401) alert(`Load error: ${msg}`);
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", description: "", price: "", category: "", stockQuantity: "", imageUrl: "" });
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price), category: p.category, stockQuantity: String(p.stockQuantity), imageUrl: p.imageUrl || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
      if (editProduct) await productApi.update(editProduct.productId, data);
      else await productApi.create(data);
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try { await productApi.delete(id); fetchProducts(); }
    catch (err: any) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const handleARUpload = async (productId: number, file: File) => {
    try {
      await productApi.uploadARModel(productId, file);
      alert("AR model uploaded!");
      fetchProducts();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "Upload failed";
      if (status === 401) {
        // The interceptor already sent the user to the sign-in page.
        return;
      }
      alert(`Upload failed (${status ?? "?"}): ${msg}`);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" className="input-field pl-9 py-2.5 text-sm" placeholder="Search products..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-gray-800 mb-5">{editProduct ? "Edit Product" : "Add New Product"}</h2>
            <div className="space-y-3">
              {[
                { name: "name", label: "Product Name", type: "text", placeholder: "e.g. Modern Sofa" },
                { name: "category", label: "Category", type: "text", placeholder: "e.g. Furniture" },
                { name: "price", label: "Price (BDT)", type: "number", placeholder: "25000" },
                { name: "stockQuantity", label: "Stock Quantity", type: "number", placeholder: "15" },
                { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">{field.label}</label>
                  <input type={field.type} className="input-field py-2.5 text-sm" placeholder={field.placeholder}
                    value={(form as any)[field.name]}
                    onChange={(e) => setForm(p => ({ ...p, [field.name]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Description</label>
                <textarea className="input-field py-2.5 text-sm resize-none" rows={3}
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-hover transition-all disabled:opacity-50">
                {saving ? "Saving..." : editProduct ? "Update" : "Create"}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Product", "Category", "Price", "Stock", "AR", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-gray-300" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800 max-w-[160px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stockQuantity === 0 ? "bg-red-100 text-red-600" : p.stockQuantity <= 5 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.hasArModel ? (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">✓ AR</span>
                      ) : (
                        <label className="cursor-pointer text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                          <Upload size={12} /> Upload
                          <input type="file" accept=".glb,.usdz,.gltf" className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleARUpload(p.productId, e.target.files[0])} />
                        </label>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.productId)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
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