// This is app/page.tsx
import MainLayout from "@/components/layout/MainLayout";
import LivestreamBanner from "@/components/sermons/LivestreamBanner";
import LatestSermons from "@/components/sermons/LatestSermons";
import Link from "next/link";
import Script from "next/script";

import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Uhai Centre Church | Faith, Hope & Community in Kiambu, Kenya",
  description:
    "Welcome to Uhai Centre Church, a vibrant community of believers in Kiambu, Kenya. Join us for worship, prayer, and fellowship as we grow together in faith.",
  keywords: [
    "church",
    "Kiambu",
    "Kenya",
    "Christian",
    "worship",
    "Sunday service",
    "community",
    "faith",
    "Jesus",
    "gospel",
    "Uhai",
    "life",
  ],
  pathname: "/",
});

export default function Home() {
  return (
    <MainLayout>
      <Script id="church-schema" type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Church",
          "name": "Uhai Centre Church",
          "url": "https://uhaicentre.church",
          "logo": "https://uhaicentre.church/logo.png",
          "image": "https://uhaicentre.church/images/church-building.jpg",
          "description": "Uhai Centre Church is a vibrant community of believers dedicated to bringing life, hope, and transformation to Kiambu and beyond through the gospel of Jesus Christ.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Biashara Street Kiambu",
            "addressLocality": "Kiambu",
            "addressRegion": "Kiambu County",
            "postalCode": "00900",
            "addressCountry": "KE"
          },
          "telephone": "+254 722 282892",
          "email": "hello@uhaicentre.church",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Sunday",
              "opens": "09:00",
              "closes": "12:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Wednesday",
              "opens": "18:00",
              "closes": "20:00"
            }
          ]
        }
      `}
      </Script>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="py-16 bg-gray-100 rounded-lg mb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to Uhai Center Church
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              A place of life, hope, and community in Kiambu, Kenya.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sermons"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition"
              >
                Watch Sermons
              </Link>
              <Link
                href="/contact"
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 rounded-md border border-blue-600 transition"
              >
                Get Connected
              </Link>
            </div>
          </div>
        </section>

        {/* Livestream Banner */}
        <section className="mb-16">
          <LivestreamBanner />
        </section>

        {/* Service Times */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Join Us This Week
          </h2>
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-3">Sunday Service</h3>
                <p className="mb-4">Every Sunday at 9:00 AM</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Join Live Stream
                </button>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-3">Midweek Service</h3>
                <p className="mb-4">Every Wednesday at 6:00 PM</p>
                <Link
                  href="/about"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Sermons */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Sermons</h2>
            <Link href="/sermons" className="text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <LatestSermons />
        </section>

        {/* Featured Event */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-gray-300"></div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-xl font-bold mb-2">
                  Easter Service Celebration
                </h3>
                <p className="text-gray-600 mb-4">
                  April 9, 2023 | 9:00 AM - 12:00 PM
                </p>
                <p className="mb-4">
                  Join us for a special Easter celebration service as we
                  commemorate the resurrection of our Lord Jesus Christ. There
                  will be worship, dance, and a powerful message of hope.
                </p>
                <Link
                  href="/events"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block transition"
                >
                  View All Events
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
