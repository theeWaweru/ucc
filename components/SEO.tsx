// In components/SEO.tsx
import Head from "next/head";
import { useRouter } from "next/router";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  canonicalUrl?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Uhai Centre Church | Faith, Hope & Community in Kiambu, Kenya",
  description = "Uhai Centre Church is a vibrant community of believers dedicated to bringing life, hope, and transformation to Kiambu and beyond through the gospel of Jesus Christ.",
  keywords = "church, Kiambu, Kenya, Christian, worship, sermons, bible study, community, faith, Jesus, gospel, Uhai, life",
  ogImage = "https://uhaicentre.church/images/og-image.jpg",
  ogType = "website",
  canonicalUrl,
}) => {
  const router = useRouter();
  const fullUrl = canonicalUrl || `https://uhaicentre.church${router.asPath}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Uhai Centre Church" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEO;
