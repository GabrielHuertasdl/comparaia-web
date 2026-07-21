interface SoftwareAppJsonLdProps {
  tool: {
    name: string;
    description: string;
    websiteUrl?: string | null;
    startingPrice?: number | null;
    hasFreeplan: boolean;
  };
}

export default function SoftwareAppJsonLd({ tool }: SoftwareAppJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "Artificial Intelligence",
    ...(tool.websiteUrl && { url: tool.websiteUrl }),
  };

  if (tool.startingPrice != null || tool.hasFreeplan) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: tool.startingPrice ?? 0,
      ...(tool.hasFreeplan && { description: "Free plan available" }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
