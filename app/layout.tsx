import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LayoutShell } from "@/components/LayoutShell";
import CustomCursor from "@/components/CustomCursor";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Best Digital Marketing Agency in Lahore, Pakistan | Elvion Solutions",
  description:
    "Elvion Solutions is the best digital marketing agency in Lahore & Pakistan. We offer social media marketing, SEO, web development & affordable online marketing services for brands and small businesses.",
  keywords:
    "digital marketing agency in Pakistan, digital marketing agency in Lahore, best digital marketing agency in Lahore, top digital marketing company Pakistan, digital marketing services in Lahore, online marketing agency Pakistan, best social media marketing agency in Lahore for small business, affordable social media management services in Pakistan, social media marketing services in Lahore for brands, social media growth services Pakistan",
  authors: [{ name: "Elvion Solutions" }],
  creator: "Elvion Solutions",
  publisher: "Elvion Solutions",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elvionsolutions.com",
    siteName: "Elvion Solutions",
    title: "Best Digital Marketing Agency in Lahore, Pakistan | Elvion Solutions",
    description:
      "Top digital marketing company in Pakistan offering social media marketing, SEO, web development & affordable online marketing services in Lahore.",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Elvion Solutions - Best Digital Marketing Agency in Lahore Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Digital Marketing Agency in Lahore, Pakistan | Elvion Solutions",
    description:
      "Top digital marketing company Pakistan — social media marketing, SEO, web development & online marketing services in Lahore.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://elvionsolutions.com",
  },
  icons: {
    icon: "/favicon.webp",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://elvionsolutions.com/#business",
      name: "Elvion Solutions",
      description:
        "Best digital marketing agency in Lahore, Pakistan. Offering social media marketing, SEO, web development and online marketing services.",
      url: "https://elvionsolutions.com",
      logo: "https://elvionsolutions.com/logo.webp",
      image: "https://elvionsolutions.com/logo.webp",
      telephone: "+92-XXX-XXXXXXX",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.5204,
        longitude: 74.3587,
      },
      areaServed: ["Lahore", "Pakistan"],
      priceRange: "$$",
      serviceType: [
        "Digital Marketing",
        "Social Media Marketing",
        "SEO Services",
        "Web Development",
        "Content Marketing",
        "Google Ads",
        "Facebook Ads",
      ],
      sameAs: [
        "https://www.facebook.com/elvionsolutions",
        "https://www.instagram.com/elvionsolutions",
        "https://www.linkedin.com/company/elvionsolutions",
        "https://twitter.com/elvionsolutions",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "120",
        bestRating: "5",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://elvionsolutions.com/#website",
      url: "https://elvionsolutions.com",
      name: "Elvion Solutions",
      description: "Best Digital Marketing Agency in Lahore, Pakistan",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://elvionsolutions.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://elvionsolutions.com/#organization",
      name: "Elvion Solutions",
      url: "https://elvionsolutions.com",
      logo: {
        "@type": "ImageObject",
        url: "https://elvionsolutions.com/logo.webp",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Urdu"],
        areaServed: "PK",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={montserrat.className}>
        <LanguageProvider>
          <AuthProvider>
            <CustomCursor />
            <LayoutShell>
              {children}
            </LayoutShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

