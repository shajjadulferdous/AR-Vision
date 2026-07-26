"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { productApi } from "@/lib/api";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    productApi.getCategories().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = keyword || selectedCategory || minPrice || maxPrice;
      let res;
      if (keyword && !selectedCategory && !minPrice && !maxPrice) {
        res = await productApi.search(keyword, page, 12);
      } else if (hasFilters) {
        res = await productApi.filter({
          keyword: keyword || undefined,
          category: selectedCategory || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          page, size: 12, sortBy, sortDir,
        });
      } else {
        res = await productApi.getAll({ page, size: 12, sortBy, sortDir });
      }
      setProducts(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, minPrice, maxPrice, page, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, keyword ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const clearFilters = () => {
    setKeyword(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice(""); setPage(0);
  };

  const hasActiveFilters = keyword || selectedCategory || minPrice || maxPrice;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Shop in <span className="text-primary">Augmented Reality</span>
          </h1>
          <p className="text-gray-500 mb-7 text-sm sm:text-base max-w-lg mx-auto">
            See how products look in your space before you buy. Look for the <span className="font-semibold text-primary">AR</span> badge.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-800 placeholder-gray-400"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            />
            {keyword && (
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setKeyword("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setSelectedCategory(""); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedCategory ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(0); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? "border-primary text-primary bg-primary/5" : "border-gray-200 text-gray-600"}`}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split("-");
                setSortBy(sb); setSortDir(sd); setPage(0);
              }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 focus:outline-none focus:border-primary"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name A–Z</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Min Price (BDT)</label>
              <input type="number" className="input-field w-32 py-2" placeholder="0"
                value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(0); }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Max Price (BDT)</label>
              <input type="number" className="input-field w-32 py-2" placeholder="Any"
                value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }} />
            </div>
            <button onClick={clearFilters} className="btn-secondary py-2">Reset Filters</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
            <p className="text-sm text-gray-400">Try different keywords or clear the filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 btn-outline px-6">Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.productId} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 transition-all">
                  <ChevronLeft size={18} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${i === page ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}