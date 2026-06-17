import ProductDetailClient from "./ProductDetailClient"
import type { Metadata, ResolvingMetadata } from "next"

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/products/slug/${params.slug}`, { next: { revalidate: 60 } })
    const json = await res.json()

    if (!json.success || !json.data) {
      return { title: "Product Not Found" }
    }

    const product = json.data

    return {
      title: product.name,
      description: product.shortDescription || product.description,
      openGraph: {
        images: product.imageUrl ? [product.imageUrl] : [],
      },
    }
  } catch {
    return { title: "Product Details" }
  }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailClient params={params} />
}
