import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Sermons | Uhai Centre Church",
  description:
    "Watch and listen to sermons from Uhai Centre Church. Dive deeper into God's Word through our Sunday messages, Bible studies, and special teachings.",
  keywords: [
    "sermons",
    "preaching",
    "Bible",
    "teaching",
    "Sunday message",
    "pastor",
    "worship",
    "Christian",
    "Kiambu",
    "Kenya",
    "gospel",
  ],
  pathname: "/sermons",
});
