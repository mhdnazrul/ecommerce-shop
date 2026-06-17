// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthUser {
  email: string
  roles: string[]
}

export interface AuthResponseDto {
  email: string
  roles: string[]
}

// ─── Products ────────────────────────────────────────────────────────────────
export interface ProductResponseDto {
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
  barcode: string | null
  weight: number | null
  imageUrl: string | null
  images: string[]
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
  isDeleted: boolean
  rowVersion: number
  categoryId: string
  category: { id: string; name: string; slug: string }
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProductSearchDto {
  search?: string
  categoryId?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export interface ProductSearchSuggestionDto {
  id: string
  name: string
  price: number
  imageUrl?: string
  slug: string
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string
  displayOrder?: number
}

export interface CreateCategoryDto {
  name: string
  description: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItemDto {
  id: string
  cartId: string
  productId: string
  quantity: number
  unitPrice: number | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
    images: string[]
    price: number
    compareAtPrice: number | null
    stockQuantity: number
    isDeleted: boolean
    isPublished: boolean
    isAvailable: boolean
  }
}

export interface CartDto {
  id: string
  items: CartItemDto[]
  itemsCount: number
  subtotal: number
}

export interface AddToCartDto {
  productId: string
  quantity: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  Pending: 'Pending',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  Pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-100 text-blue-700 border-blue-200',
  Shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  Delivered:  'bg-green-100 text-green-700 border-green-200',
  Cancelled:  'bg-red-100 text-red-700 border-red-200',
}

export interface OrderItemDto {
  id: string
  productId: string
  productName: string
  productSlug: string | null
  productImage: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ShippingAddressDto {
  id: string
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string | null
  country: string
  phone: string | null
}

export interface OrderResponseDto {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  currency: string
  notes: string | null
  shippingAddress: ShippingAddressDto | null
  items: OrderItemDto[]
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
}

export interface OrderQueryDto {
  page?: number
  limit?: number
  status?: OrderStatus
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errors: string[] | null
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItemDto {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
    images: string[]
    price: number
    compareAtPrice: number | null
    stockQuantity: number
    isDeleted: boolean
    isPublished: boolean
    isAvailable: boolean
  }
}

export interface AddWishlistItemDto {
  productId: string
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface ProductReviewDto {
  id: string
  userId: string
  userName: string
  productId: string
  rating: number
  title: string
  comment: string
  createdAt: string
}

export interface CreateReviewDto {
  productId: string
  rating: number
  title: string
  comment: string
}
