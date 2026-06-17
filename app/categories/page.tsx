"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getFullImageUrl } from "@/lib/utils"

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
  parentId: string | null
  _count?: { products: number }
  children?: CategoryItem[]
}

export default function CategoriesPage() {
  const [tree, setTree] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/categories/tree")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTree(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Browse products by category</p>
      </div>

      {tree.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4 opacity-30">📂</p>
          <p className="text-xl font-bold text-gray-500">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tree.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: CategoryItem }) {
  const imgUrl = getFullImageUrl(category.imageUrl)

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imgUrl ? (
            <Image src={imgUrl} alt={category.name} width={56} height={56} className="object-cover" unoptimized={imgUrl.startsWith('http://localhost') || imgUrl.startsWith('http://127.0.0.1')} />
          ) : (
            <span className="text-2xl font-bold text-indigo-600">{category.name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg truncate">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{category.description}</p>
          )}
          {category._count && (
            <p className="text-xs font-bold text-gray-400 mt-2">
              {category._count.products} product{category._count.products === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subcategories</p>
          <div className="flex flex-wrap gap-2">
            {category.children.slice(0, 4).map((child: any) => (
              <span key={child.id} className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                {child.name}
              </span>
            ))}
            {category.children.length > 4 && (
              <span className="text-xs bg-gray-100 text-gray-400 font-medium px-2.5 py-1 rounded-full">
                +{category.children.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}
