import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import PrayerRequestForm from "@/components/forms/PrayerRequestForm";

import { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Prayer Requests | Uhai Centre Church',
  description: 'Submit your prayer requests to Uhai Centre Church. Our prayer team is committed to lifting your needs before God in prayer.',
  keywords: ['prayer', 'prayer request', 'intercession', 'pray', 'Christian', 'church', 'faith', 'Kiambu', 'Kenya'],
  pathname: '/prayer',
});

export default function PrayerPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Prayer Requests</h1>

        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">
              We Would Love to Pray for You
            </h2>
            <p className="mb-4">
              At Uhai Center Church, we believe in the power of prayer. Our
              dedicated prayer team is committed to lifting your needs before
              God.
            </p>
            <p>
              You can submit your prayer request anonymously if you prefer. All
              requests are kept confidential and are shared only with our prayer
              team.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Submit a Prayer Request</h2>
            <PrayerRequestForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
