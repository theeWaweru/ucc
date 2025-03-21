"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaVideo,
  FaCalendarAlt,
  FaFileAlt,
  FaPray,
  FaChartBar,
  FaCog,
  FaMoneyBillWave,
  FaChurch,
} from "react-icons/fa";
import axios from "axios";

// Optional: Add this to your package.json if you want to use it
// npm install react-countup framer-motion
import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [counts, setCounts] = useState({
    sermons: 0,
    events: 0,
    blog: 0,
    prayer: 0,
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Redirect to login page if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
    } else if (status === "authenticated") {
      setLoading(false);

      // Fetch counts for dashboard
      fetchCounts();
    }
  }, [status, router]);

  // Function to fetch all counts
  const fetchCounts = async () => {
    try {
      await Promise.all([
        fetchPrayerRequestCount(),
        fetchSermonCount(),
        fetchBlogCount(),
        fetchEventsCount(),
        // Add other count fetching functions as they become available
      ]);

      if (isMounted.current) {
        setCountsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
      if (isMounted.current) {
        setCountsLoaded(true); // Still set loaded even if there's an error
      }
    }
  };

  // Function to fetch prayer request count
  const fetchPrayerRequestCount = async () => {
    try {
      const response = await axios.get("/api/prayer?count=true");

      if (response.data.success && isMounted.current) {
        setCounts((prev) => ({
          ...prev,
          prayer: response.data.count || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch prayer count:", error);
    }
  };

  // Function to fetch sermon count
  const fetchSermonCount = async () => {
    try {
      const response = await axios.get("/api/sermons?count=true");

      if (response.data?.success && isMounted.current) {
        setCounts((prev) => ({
          ...prev,
          sermons: response.data.count || 0,
        }));
      }
    } catch (error) {
      // Just swallow the error - this endpoint might not exist yet
      console.error("Failed to fetch sermon count:", error);
    }
  };

  // Function to fetch blog count
  const fetchBlogCount = async () => {
    try {
      const response = await axios.get("/api/blog?count=true");

      if (response.data?.success && isMounted.current) {
        setCounts((prev) => ({
          ...prev,
          blog: response.data.count || 0,
        }));
      }
    } catch (error) {
      // Just swallow the error - this endpoint might not exist yet
      console.error("Failed to fetch blog count:", error);
    }
  };

  // Function to fetch events count
  const fetchEventsCount = async () => {
    try {
      const response = await axios.get("/api/events?count=true");

      if (response.data?.success && isMounted.current) {
        setCounts((prev) => ({
          ...prev,
          events: response.data.count || 0,
        }));
      }
    } catch (error) {
      // Just swallow the error - this endpoint might not exist yet
      console.error("Failed to fetch events count:", error);
    }
  };

  if (loading || status !== "authenticated") {
    return null; // Layout handles loading state
  }

  // Animation variants for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    <div className="py-6 relative">
      {/* Abstract SVG Background */}
      <div className="absolute top-0 right-0 -z-10 opacity-5 text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="400"
          height="400"
          viewBox="0 0 800 800"
        >
          <path
            fill="currentColor"
            d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63M-24 -199L1 -155M-88 -85L-80 -118M-111 -179L-138 -220M111 -388L195 -348M370 -338L250 -300M400 -180L369 -205M400 -180L349 -128M400 -180L401 -161M400 -180L426 -187M400 -180L440 -176M400 -180L450 -207M400 -180L390 -257M400 -180L355 -235"
            strokeWidth="10"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaChurch className="mr-2 text-blue-600" />
          Admin Dashboard
        </h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg text-white shadow-lg"
        >
          <p className="text-sm">
            Welcome back,{" "}
            <span className="font-semibold">
              {session?.user?.name || session?.user?.email}
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Statistics Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <FaVideo className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="text-sm text-gray-600">Sermons</p>
            <p className="text-xl font-bold text-blue-600">
              {countsLoaded ? (
                <CountUp end={counts.sermons} duration={2} separator="," />
              ) : (
                <span className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-blue-500 border-r-transparent align-[-0.125em]"></span>
              )}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <FaPray className="mx-auto mb-2 text-purple-500" size={24} />
            <p className="text-sm text-gray-600">Prayer Requests</p>
            <p className="text-xl font-bold text-purple-600">
              {countsLoaded ? (
                <CountUp end={counts.prayer} duration={2} separator="," />
              ) : (
                <span className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-r-transparent align-[-0.125em]"></span>
              )}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <FaCalendarAlt className="mx-auto mb-2 text-green-500" size={24} />
            <p className="text-sm text-gray-600">Events</p>
            <p className="text-xl font-bold text-green-600">
              {countsLoaded ? (
                <CountUp end={counts.events} duration={2} separator="," />
              ) : (
                <span className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-green-500 border-r-transparent align-[-0.125em]"></span>
              )}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <FaFileAlt className="mx-auto mb-2 text-yellow-500" size={24} />
            <p className="text-sm text-gray-600">Blog Posts</p>
            <p className="text-xl font-bold text-yellow-600">
              {countsLoaded ? (
                <CountUp end={counts.blog} duration={2} separator="," />
              ) : (
                <span className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-yellow-500 border-r-transparent align-[-0.125em]"></span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* Dashboard Cards */}
        <DashboardCard
          title="Sermons"
          description="Manage sermon videos and categories"
          link="/admin/sermons"
          count={counts.sermons > 0 ? counts.sermons.toString() : ""}
          icon={<FaVideo className="text-indigo-500" size={24} />}
          color="indigo"
          variants={item}
        />
        <DashboardCard
          title="Prayer Requests"
          description="View and manage prayer requests"
          link="/admin/prayer"
          count={counts.prayer > 0 ? counts.prayer.toString() : ""}
          icon={<FaPray className="text-blue-500" size={24} />}
          color="blue"
          variants={item}
        />
        <DashboardCard
          title="Events"
          description="Create and manage church events"
          link="/admin/events"
          count={counts.events > 0 ? counts.events.toString() : ""}
          icon={<FaCalendarAlt className="text-green-500" size={24} />}
          color="green"
          variants={item}
        />
        <DashboardCard
          title="Blog"
          description="Publish news and updates"
          link="/admin/blog"
          count={counts.blog > 0 ? counts.blog.toString() : ""}
          icon={<FaFileAlt className="text-yellow-500" size={24} />}
          color="yellow"
          variants={item}
        />
        <DashboardCard
          title="Payments"
          description="Monitor and manage donations"
          link="/admin/payments"
          count=""
          icon={<FaMoneyBillWave className="text-green-600" size={24} />}
          color="emerald"
          variants={item}
        />
        <DashboardCard
          title="Analytics"
          description="View website traffic and engagement"
          link="/admin/analytics"
          count=""
          icon={<FaChartBar className="text-purple-500" size={24} />}
          color="purple"
          variants={item}
        />
        <DashboardCard
          title="Settings"
          description="Configure website settings"
          link="/admin/settings"
          count=""
          icon={<FaCog className="text-gray-500" size={24} />}
          color="gray"
          variants={item}
        />
      </motion.div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  link,
  count,
  icon,
  color,
  variants,
}: {
  title: string;
  description: string;
  link: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  variants: any;
}) {
  // Define color variants for different card types
  const colorVariants: Record<
    string,
    { light: string; border: string; hover: string }
  > = {
    blue: {
      light: "bg-blue-50",
      border: "border-blue-200",
      hover: "hover:border-blue-500 hover:shadow-blue-100",
    },
    indigo: {
      light: "bg-indigo-50",
      border: "border-indigo-200",
      hover: "hover:border-indigo-500 hover:shadow-indigo-100",
    },
    green: {
      light: "bg-green-50",
      border: "border-green-200",
      hover: "hover:border-green-500 hover:shadow-green-100",
    },
    yellow: {
      light: "bg-yellow-50",
      border: "border-yellow-200",
      hover: "hover:border-yellow-500 hover:shadow-yellow-100",
    },
    purple: {
      light: "bg-purple-50",
      border: "border-purple-200",
      hover: "hover:border-purple-500 hover:shadow-purple-100",
    },
    emerald: {
      light: "bg-emerald-50",
      border: "border-emerald-200",
      hover: "hover:border-emerald-500 hover:shadow-emerald-100",
    },
    gray: {
      light: "bg-gray-50",
      border: "border-gray-200",
      hover: "hover:border-gray-500 hover:shadow-gray-100",
    },
  };

  // Get the color variant or default to blue
  const colorStyle = colorVariants[color] || colorVariants.blue;

  return (
    <motion.div
      variants={variants}
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 300 },
      }}
    >
      <Link href={link}>
        <div
          className={`bg-white overflow-hidden shadow-md rounded-lg border-2 ${colorStyle.border} p-6 ${colorStyle.hover} cursor-pointer transition-all duration-300 relative group`}
        >
          {/* Hover effect background */}
          <div
            className={`absolute inset-0 ${colorStyle.light} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg`}
          ></div>

          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center">
              <div className="mr-3 transform group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            {count && (
              <div className="flex items-center">
                <CountUp
                  end={parseInt(count)}
                  duration={2}
                  separator=","
                  delay={0.5}
                  className="animate-in fade-in duration-500"
                >
                  {({ countUpRef }) => (
                    <span
                      ref={countUpRef}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
                    />
                  )}
                </CountUp>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 relative z-10">{description}</p>

          {/* Animated corner accent */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-transparent to-gray-200 group-hover:to-blue-200 rounded-tl-xl transition-colors duration-300 z-0"></div>
        </div>
      </Link>
    </motion.div>
  );
}
