import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
}

export function generateMetadata({ title, description, canonical, ogImage }: SEOProps): Metadata {
  const siteTitle = `${title} | Aqel Jehad Ltd`
  const siteUrl = 'https://www.aqeljehad-ltd.com' // Replace with your actual site URL

  return {
    title: siteTitle,
    description: description,
    openGraph: {
      title: siteTitle,
      description: description,
      url: canonical || siteUrl,
      siteName: 'Aqel Jehad Ltd',
      images: [
        {
          url: ogImage || `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: description,
      images: [ogImage || `${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonical || siteUrl,
    },
  }
}

export function SEO() {
  // This component doesn't render anything, it's used for metadata generation
  return null
}