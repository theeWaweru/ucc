import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Church Calendar | Uhai Centre Church",
  description:
    "View the Uhai Centre Church calendar for all upcoming services, Bible studies, prayer meetings, and special events in our Kiambu, Kenya community.",
  keywords: [
    "calendar",
    "schedule",
    "events",
    "church events",
    "service times",
    "bible study",
    "prayer meeting",
    "Kiambu",
    "Kenya",
  ],
  pathname: "/calendar",
});
