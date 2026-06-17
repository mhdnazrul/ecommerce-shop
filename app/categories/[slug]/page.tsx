import CategoryDetailClient from "./CategoryDetailClient"
import type { Metadata } from "next"

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/categories/slug/${params.slug}?page=1&limit=1`, {
      next: { revalidate: 60 },
    })
    const json = await res.json()

    if (!json.success || !json.data) {
      return { title: "Category Not Found" }
    }

    const { category } = json.data

    return {
      title: category.name,
      description: category.description || `${category.name} products at Shopfinity`,
      openGraph: {
        images: category.imageUrl ? [category.imageUrl] : [],
      },
    }
  } catch {
    return { title: "Category" }
  }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryDetailClient params={params} />
}
