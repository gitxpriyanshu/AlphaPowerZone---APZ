import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  productData?: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
  };
}

const SEO: React.FC<SEOProps> = ({
  title = "AlphaPowerZone | Premium Fitness & Gym Equipment",
  description = "Engineered for performance. APZ offers premium gym equipment, high-performance apparel, and science-backed supplements for elite athletes in India.",
  image = "/og-image.jpg",
  url = "https://alphapowerzone.com",
  type = "website",
  productData
}) => {
  const fullTitle = `${title} | AlphaPowerZone`;
  const canonicalUrl = url;

  // Structured Data (JSON-LD)
  const structuredData = productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.name,
    "image": [productData.image],
    "description": productData.description,
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": productData.availability === 'in_stock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AlphaPowerZone",
    "url": "https://alphapowerzone.com",
    "logo": "https://alphapowerzone.com/logo.png",
    "sameAs": [
      "https://facebook.com/alphapowerzone",
      "https://instagram.com/alphapowerzone"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
