"use client"

import { useState, use, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-client"
import { getFullImageUrl } from "@/lib/utils"
import { formatPrice } from "@/lib/formatters"
import Link from "next/link"
import toast from "react-hot-toast"

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  price: number
  compareAtPrice: number | null
  costPrice: number | null
  stockQuantity: number
  sku: string | null
  imageUrl: string | null
  images: string[]
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
  category: { id: string; name: string; slug: string }
  createdAt: string
  updatedAt: string
}

export default function ProductDetailClient(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const { user, isLoading: authLoading } = useAuth()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [reviewTab, setRevTab] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5)

  // Review form
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/slug/${params.slug}`)
        const json = await res.json()
        if (json.success) {
          setProduct(json.data)
        } else {
          setProduct(null)
        }
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.slug])

  useEffect(() => {
    if (!product) return
    setLoadingReviews(true)
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data.items || json.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false))
  }, [product])

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-40 text-center">
        <p className="text-6xl mb-4 opacity-30">🔍</p>
        <p className="text-2xl font-bold text-gray-400">Product not found</p>
        <Link href="/products" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
          Browse all products →
        </Link>
      </div>
    )
  }

  const allImages = [product.imageUrl, ...product.images].filter(Boolean) as string[]
  const imgUrl = getFullImageUrl(allImages[selectedImage])
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0"

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in first")
      return
    }
    setAdding(true)
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Added to Cart")
      } else {
        toast.error(json.message || "Failed to add to cart")
      }
    } catch {
      toast.error("Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to review")
      return
    }
    if (!title.trim() || !comment.trim()) {
      toast.error("Please fill out the review form fully")
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating, title, comment }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Review submitted!")
        setTitle("")
        setComment("")
        setRating(5)
        setReviews((prev) => [json.data, ...prev])
      } else {
        toast.error(json.message || "Failed to submit review")
      }
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const userAlreadyReviewed = user && reviews.some((r: any) => r.userId === user.id)
  const visibleReviews = reviews.slice(0, visibleReviewsCount)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-16">
      {/* Left: Image Gallery */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        <div className="sticky top-24 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden min-h-[500px] p-8 relative">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain mix-blend-multiply p-8"
              priority
              unoptimized={imgUrl.startsWith('http://localhost') || imgUrl.startsWith('http://127.0.0.1')}
            />
          ) : (
            <span className="text-8xl opacity-10">📦</span>
          )}
          <div className="absolute bottom-6 left-6 flex gap-2">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                Featured
              </span>
            )}
          </div>
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                  i === selectedImage ? "border-indigo-600" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getFullImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                    unoptimized={getFullImageUrl(img).startsWith('http://localhost') || getFullImageUrl(img).startsWith('http://127.0.0.1')}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Details */}
      <div className="lg:w-1/2 flex flex-col">
        <nav className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-gray-900">Home</Link> /{" "}
          <Link href="/products" className="hover:text-gray-900">Products</Link> /{" "}
          <span className="text-gray-900">{product.category.name}</span>
        </nav>

        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400 text-lg">
            {"★".repeat(Math.round(Number(avgRating)))}
            {"☆".repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <span className="font-bold text-gray-900">{avgRating} Stars</span>
          <span className="text-gray-400 font-medium">({reviews.length} reviews)</span>
        </div>

        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-8">
          <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice!)}</span>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>

        {product.shortDescription && (
          <p className="text-gray-500 text-sm mb-4">{product.shortDescription}</p>
        )}

        {product.description && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed max-w-prose text-lg whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {product.sku && (
          <p className="text-xs text-gray-400 mb-2">SKU: {product.sku}</p>
        )}

        <div
          className={`text-sm font-bold tracking-wide uppercase mb-6 ${
            product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : "Out of Stock"}
        </div>

        {product.stockQuantity > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-b border-gray-200 py-8 my-4">
            <div className="flex items-center gap-4 bg-gray-100 rounded-full px-6 py-3 min-w-[140px] justify-between">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-gray-600 hover:text-black font-bold text-xl transition-colors"
              >
                −
              </button>
              <span className="text-gray-900 font-bold text-lg select-none w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                className="text-gray-600 hover:text-black font-bold text-xl transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || authLoading}
              className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-4 text-base font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {adding ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                `Add to Cart — ${formatPrice(product.price * qty)}`
              )}
            </button>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <button
            onClick={() => setRevTab(!reviewTab)}
            className="flex justify-between items-center w-full group"
          >
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
              Customer Reviews ({reviews.length})
            </h3>
            <span className="text-gray-400 font-bold text-xl">{reviewTab ? "−" : "+"}</span>
          </button>

          {reviewTab && (
            <div className="mt-6 space-y-8">
              {loadingReviews ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                  {visibleReviews.map((r: any) => (
                    <div key={r.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex text-yellow-400 text-sm">
                          {"★".repeat(r.rating)}
                          {"☆".repeat(5 - r.rating)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{r.title}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{r.comment}</p>
                      <div className="text-xs text-gray-400 font-medium">
                        {r.userName} • {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                  {visibleReviewsCount < reviews.length && (
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => setVisibleReviewsCount((prev) => prev + 5)}
                        className="px-6 py-2 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
                      >
                        Load More Reviews
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Write Review Form */}
              {user && !userAlreadyReviewed && (
                <form onSubmit={submitReview} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 tracking-tight">Write a Review</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-gray-700">Rating</span>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm font-medium"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Review Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-medium"
                  />
                  <textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
              {user && userAlreadyReviewed && (
                <div className="bg-green-50 p-4 rounded-lg text-center text-sm font-bold text-green-700 border border-green-100">
                  You have already reviewed this product.
                </div>
              )}
              {!user && (
                <div className="bg-gray-100 p-4 rounded-lg text-center text-sm font-bold text-gray-500">
                  Please sign in to write a review.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
