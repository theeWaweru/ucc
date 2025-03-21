import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Church Blog | Uhai Centre Church",
  description:
    "Read the latest news, announcements, devotionals, and updates from Uhai Centre Church in Kiambu, Kenya.",
  keywords: [
    "blog",
    "church blog",
    "news",
    "announcements",
    "devotional",
    "articles",
    "spiritual growth",
    "Kiambu",
    "Kenya",
    "Christian",
  ],
  type: "article",
  pathname: "/blog",
});
