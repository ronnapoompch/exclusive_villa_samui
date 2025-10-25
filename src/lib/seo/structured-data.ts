import { Organization, WebSite, BreadcrumbList } from 'schema-dts'

// Organization structured data
export const organizationLD: Organization = {
  "@type": "Organization",
  name: "Exclusive Villa Samui",
  description: "Luxury villa rental service in Koh Samui, Thailand offering exclusive beachfront properties with world-class amenities.",
  url: "https://exclusive-villa-samui.com",
  logo: "https://exclusive-villa-samui.com/assets/images/logo/logo1.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+66-123-456-789",
    contactType: "customer service",
    availableLanguage: ["English", "Thai"]
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "TH",
    addressRegion: "Surat Thani",
    addressLocality: "Koh Samui",
    postalCode: "84140"
  },
  sameAs: [
    "https://www.facebook.com/exclusivevillasamui",
    "https://www.instagram.com/exclusivevillasamui",
    "https://www.twitter.com/exclusivesamui"
  ]
}

// Website structured data
export const websiteLD: WebSite = {
  "@type": "WebSite",
  name: "Exclusive Villa Samui",
  url: "https://exclusive-villa-samui.com",
  description: "Luxury villa rental service in Koh Samui, Thailand",
  publisher: {
    "@type": "Organization",
    name: "Exclusive Villa Samui"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://exclusive-villa-samui.com/search?q={search_term_string}"
    }
  }
}

// Generate breadcrumb structured data
export const generateBreadcrumbLD = (items: Array<{ name: string; url: string }>): BreadcrumbList => {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}