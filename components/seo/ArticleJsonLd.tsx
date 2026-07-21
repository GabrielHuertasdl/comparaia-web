interface ArticleJsonLdProps {
  article: {
    title: string;
    excerpt: string;
    publishedAt?: Date | null;
    slug: string;
    author?: { name: string } | null;
  };
}

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    author: article.author
      ? { "@type": "Person", name: article.author.name }
      : { "@type": "Organization", name: "ComparaIA" },
    publisher: {
      "@type": "Organization",
      name: "ComparaIA",
      url: "https://comparaia.es",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://comparaia.es/noticias/" + article.slug,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
