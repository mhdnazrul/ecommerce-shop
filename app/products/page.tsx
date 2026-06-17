"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/formatters"
import { getFullImageUrl } from "@/lib/utils"
import toast from "react-hot-toast"

interface ProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  images: string[]
  tags: string[]
  isFeatured: boolean
  stockQuantity: number
  category: { id: string; name: string; slug: string }
  createdAt: string
}

interface PageMeta {
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface CategoryOption {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ProductItem[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")

  const page = Number(searchParams.get("page")) || 1
  const categorySlug = searchParams.get("categorySlug") || ""
  const sortBy = searchParams.get("sortBy") || "createdAt"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (categorySlug) params.set("categorySlug", categorySlug)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("page", String(page))
      params.set("limit", "12")

      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      if (json.success) {
        setProducts(json.data.items)
        setMeta(json.data)
      } else {
        toast.error(json.message || "Failed to load products")
      }
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [search, categorySlug, sortBy, sortOrder, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data)
      })
      .catch(() => {})
  }, [])

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    if (updates.search !== undefined || updates.categorySlug !== undefined || updates.sortBy !== undefined) {
      params.delete("page")
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    updateParams({ search: searchInput })
  }

  const handleCategoryChange = (slug: string) => {
    updateParams({ categorySlug: slug })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split("-")
    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">
          {meta ? `${meta.totalCount} product${meta.totalCount === 1 ? "" : "s"} found` : "Browse our catalog"}
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </form>

        <select
          value={categorySlug}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={handleSortChange}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4 opacity-30">🔍</p>
          <p className="text-xl font-bold text-gray-500">No products found</p>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const imgUrl = getFullImageUrl(product.imageUrl || product.images[0])
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
            const discountPercent = hasDiscount
              ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
              : 0

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-xl hover:border-gray-300 transition-all duration-200 flex flex-col"
              >
                <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized={imgUrl.startsWith('http://localhost') || imgUrl.startsWith('http://127.0.0.1')}
                    />
                  ) : (
                    <span className="text-5xl opacity-20">📦</span>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    {product.category.name}
                  </p>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-3 flex items-center gap-2">
                    <span className="text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice!)}</span>
                    )}
                  </div>

                  {product.stockQuantity <= 0 && (
                    <p className="text-xs font-bold text-red-500 mt-1">Out of Stock</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={!meta.hasPrev}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(meta.totalPages, 7) }).map((_, i) => {
            let pageNum: number
            if (meta.totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= meta.totalPages - 3) {
              pageNum = meta.totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }

            return (
              <button
                key={pageNum}
                onClick={() => updateParams({ page: String(pageNum) })}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                  pageNum === page
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={!meta.hasNext}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
