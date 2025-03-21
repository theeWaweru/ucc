import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Give | Uhai Centre Church",
  description:
    "Support the mission and ministry of Uhai Centre Church through your generous giving. Donate via M-Pesa for tithes, offerings, and special campaigns.",
  keywords: [
    "give",
    "tithe",
    "offering",
    "donation",
    "mpesa",
    "charity",
    "church giving",
    "stewardship",
    "Kiambu",
    "Kenya",
  ],
  pathname: "/give",
});
