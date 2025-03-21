import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Contact Us | Uhai Centre Church",
  description:
    "Get in touch with Uhai Centre Church. Find our location, service times, contact information, and send us a message directly through our contact form.",
  keywords: [
    "contact",
    "church contact",
    "location",
    "address",
    "phone",
    "email",
    "service times",
    "Kiambu",
    "Kenya",
  ],
  pathname: "/contact",
});
