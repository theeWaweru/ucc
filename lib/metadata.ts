import { Metadata } from "next";

type MetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  pathname?: string;
};

export function generateMetadata({
  title = "Uhai Centre Church",
  description = "Uhai Centre Church is a vibrant community of believers dedicated to bringing life, hope, and transformation to Kiambu and beyond through the gospel of Jesus Christ.",
  keywords = [
    "church",
    "Kiambu",
    "Kenya",
    "Christian",
    "worship",
    "sermons",
    "bible study",
    "community",
    "faith",
    "Jesus",
    "gospel",
    "Uhai",
    "life",
  ],
  image = "/images/og-image.jpg",
  type = "website",
  pathname = "",
}: MetadataProps): Metadata {
  const url = `https://uhaicentre.church${pathname}`;

  return {
    title: {
      default: title,
      template: `%s | Uhai Centre Church`,
    },
    description,
    keywords,
    metadataBase: new URL("https://uhaicentre.church"),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Uhai Centre Church",
      locale: "en_US",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
