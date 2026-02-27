import React from "react";
import { notFound } from "next/navigation";

// Main Service Pages
import WebDesigns from "./WebDesigns";
import DigitalMarketing from "./DigitalMarketing";
import UIUX from "./UIUX";

// Website Design Sub-pages
import BusinessWebsiteDesign from "./WebsiteDesigns/BusinessWebsiteDesign";
import PortfolioWebsite from "./WebsiteDesigns/PorfolioWebsite";
import EcommWebsite from "./WebsiteDesigns/EcommWebsite";
import CustomWebApp from "./WebsiteDesigns/CustomWebApp";
import FullStackSolutions from "./WebsiteDesigns/FullStackSolutions";

// Digital Marketing Sub-pages
import SEO from "./DigitalMarketing/SEO";
import SMM from "./DigitalMarketing/SMM";
import GoogleMetaAds from "./DigitalMarketing/GoogleMataAds";
import ContentMarketing from "./DigitalMarketing/ContentMarketing";
import Analytics from "./DigitalMarketing/Analytics";

// UI/UX Sub-pages
import WebsiteUIUX from "./UIUX/WebsiteUIUX";
import MobileAppUIUX from "./UIUX/MobileAppUIUX";
import BrandingLogo from "./UIUX/BrandingLogo";
import Prototyping from "./UIUX/ProtoTyping";

// Define params type for Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  // Map slugs to components
  const components: { [key: string]: React.ComponentType } = {
    // Main Categories
    "web-designs": WebDesigns,
    "digital-marketing": DigitalMarketing,
    "ui-ux": UIUX,

    // Web Designs Sub-services
    "business-web": BusinessWebsiteDesign,
    "portfolio-web": PortfolioWebsite,
    "ecommerce": EcommWebsite,
    "custom-app": CustomWebApp,
    "fullstack": FullStackSolutions,

    // Digital Marketing Sub-services
    "seo": SEO,
    "smm": SMM,
    "ads": GoogleMetaAds,
    "content": ContentMarketing,
    "analytics": Analytics,

    // UI/UX Sub-services
    "web-ui": WebsiteUIUX,
    "app-ui": MobileAppUIUX,
    "branding": BrandingLogo,
    "prototyping": Prototyping,
  };

  const Component = components[slug];

  if (!Component) {
    notFound();
  }

  return <Component />;
}
