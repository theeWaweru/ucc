"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push(
        "/auth/sign-in?callbackUrl=" + encodeURIComponent(pathname || "/admin")
      );
    }
  }, [status, router, pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Define navigation items with icons
  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <FaTachometerAlt size={18} />,
      exact: true,
    },
    { href: "/admin/sermons", label: "Sermons", icon: <FaVideo size={18} /> },
    {
      href: "/admin/prayer",
      label: "Prayer Requests",
      icon: <FaPray size={18} />,
    },
    {
      href: "/admin/events",
      label: "Events",
      icon: <FaCalendarAlt size={18} />,
    },
    { href: "/admin/blog", label: "Blog", icon: <FaFileAlt size={18} /> },
    {
      href: "/admin/payments",
      label: "Payments",
      icon: <FaMoneyBillWave size={18} />,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: <FaChartBar size={18} />,
    },
    { href: "/admin/settings", label: "Settings", icon: <FaCog size={18} /> },
  ];

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If authenticated, show admin layout
  if (status === "authenticated") {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-gray-800 text-white">
            <div className="px-4 py-6 flex items-center justify-center border-b border-gray-700">
              <h1 className="text-xl font-bold">Uhai Admin</h1>
            </div>

            <div className="flex-1 flex flex-col pt-5">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-2 py-3 text-sm font-medium rounded-md hover:bg-gray-700 ${
                      (item.exact && pathname === item.href) ||
                      (!item.exact && pathname?.startsWith(item.href))
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-600">
                    <FaUser className="text-white" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-300">
                    {session?.user?.role || "Admin"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="mt-4 flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden bg-gray-800 text-white w-full fixed top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold">Uhai Admin</h1>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <nav className="px-2 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700 ${
                    (item.exact && pathname === item.href) ||
                    (!item.exact && pathname?.startsWith(item.href))
                      ? "bg-gray-700"
                      : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-3" />
                Sign Out
              </button>
            </nav>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none mt-0 md:mt-0">
            <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8 mt-14 md:mt-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here due to the redirect
  return null;
}
