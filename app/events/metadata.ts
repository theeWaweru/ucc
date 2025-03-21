import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";


export const metadata: Metadata = generateMetadata({
  title: "Events | Uhai Centre Church",
  description:
    "Join us for upcoming events at Uhai Centre Church. From regular services to special occasions, find all our church activities and gatherings.",
  keywords: [
    "events",
    "church events",
    "community",
    "calendar",
    "activities",
    "service",
    "gathering",
    "Kiambu",
    "Kenya",
    "Christian",
  ],
  pathname: "/events",
});