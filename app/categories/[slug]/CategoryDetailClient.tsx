"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/formatters"
import { getFullImageUrl } from "@/lib/utils"

interface ProductItem {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  images: string[]
  stockQuantity: number
  isFeatured: boolean
  category: { id: string; name: string; slug: string }
  createdAt: string
}

interface CategoryDetail {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
  parentId: string | null
  parent: { id: string; name: string; slug: string } | null
  children: { id: string; name: string; slug: string; displayOrder: number }[]
}

export default function CategoryDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [data, setData] = useState<{
    category: CategoryDetail
    products: ProductItem[]
    totalCount: number
    page: number
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/categories/slug/${slug}?page=${page}&limit=12`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, page])

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-40 text-center">
        <p className="text-6xl mb-4 opacity-30">📂</p>
        <p className="text-2xl font-bold text-gray-400">Category not found</p>
        <Link href="/categories" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
          Browse all categories →
        </Link>
      </div>
    )
  }

  const { category, products, totalCount, totalPages } = data
  const imgUrl = getFullImageUrl(category.imageUrl)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 font-medium">
        <Link href="/" className="hover:text-gray-900">Home</Link> /{" "}
        <Link href="/categories" className="hover:text-gray-900">Categories</Link> /{" "}
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-start gap-6 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        {imgUrl && (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
            <Image src={imgUrl} alt={category.name} fill className="object-cover" unoptimized={imgUrl.startsWith('http://localhost') || imgUrl.startsWith('http://127.0.0.1')} sizes="80px" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900">{category.name}</h1>
          {category.description && <p className="text-gray-500 mt-1 max-w-2xl">{category.description}</p>}
          <p className="text-sm font-bold text-gray-400 mt-2">{totalCount} product{totalCount === 1 ? "" : "s"}</p>
        </div>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Subcategories</h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-5xl mb-3 opacity-30">📦</p>
          <p className="text-lg font-bold text-gray-500">No products in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const pImgUrl = getFullImageUrl(product.imageUrl || product.images[0])
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-xl hover:border-gray-300 transition-all duration-200 flex flex-col"
              >
                <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                  {pImgUrl ? (
                    <Image
                      src={pImgUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized={pImgUrl.startsWith('http://localhost') || pImgUrl.startsWith('http://127.0.0.1')}
                    />
                  ) : (
                    <span className="text-5xl opacity-20">📦</span>
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
