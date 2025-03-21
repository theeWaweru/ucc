import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

import { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'About Uhai Centre Church',
  description: 'Learn about Uhai Centre Church, our mission, vision, values, and the leadership team serving our community in Kiambu, Kenya.',
  keywords: ['about', 'church history', 'mission', 'vision', 'values', 'leadership', 'pastor', 'Kiambu', 'Kenya', 'Christian', 'Uhai'],
  pathname: '/about',
});

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="py-12 mb-12 bg-blue-50 rounded-lg">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6 text-center">
              About Uhai Center Church
            </h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              A community of believers dedicated to bringing life, hope, and
              transformation to Kiambu and beyond.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4">
              Uhai Center Church was founded in [year] with a vision to
              establish a life-giving church that would impact the community of
              Kiambu. Starting with just a handful of dedicated believers, we
              have grown into a vibrant community that continues to touch lives
              through the power of God's Word.
            </p>
            <p className="mb-4">
              The name "Uhai" meaning "Life" in Swahili reflects our core
              mission - to bring spiritual, social, and economic life to our
              community and beyond.
            </p>
            <p>
              Over the years, we have established various ministries and
              outreach programs that address the holistic needs of our community
              while pointing people to Christ, the ultimate source of life.
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p>
                To bring life and transformation through sharing the gospel,
                discipleship, and community service.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p>
                To be a vibrant church that raises disciples who influence
                society with Kingdom values.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Biblical Foundation</li>
                <li>Excellence</li>
                <li>Community</li>
                <li>Service</li>
                <li>Growth</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Leadership</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Leadership Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-1">Senior Pastor Name</h3>
                <p className="text-gray-600 mb-4">Senior Pastor</p>
                <p className="mb-4">
                  Brief bio of the senior pastor and their journey with the
                  church.
                </p>
              </div>
            </div>

            {/* Leadership Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-1">
                  Assistant Pastor Name
                </h3>
                <p className="text-gray-600 mb-4">Assistant Pastor</p>
                <p className="mb-4">
                  Brief bio of the assistant pastor and their role in the
                  church.
                </p>
              </div>
            </div>

            {/* Leadership Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-1">Worship Leader Name</h3>
                <p className="text-gray-600 mb-4">Worship Leader</p>
                <p className="mb-4">
                  Brief bio of the worship leader and their ministry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us This Sunday</h2>
          <p className="text-xl mb-6">
            We'd love to have you worship with us. Our services start at 9:00 AM
            every Sunday.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-bold hover:bg-gray-100"
            >
              Get Directions
            </Link>
            <Link
              href="/sermons"
              className="bg-transparent text-white px-6 py-3 rounded-md font-bold border border-white hover:bg-blue-700"
            >
              Watch Online
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
