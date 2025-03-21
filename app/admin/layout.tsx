// Complete and unified code
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
  FaChartLine,
  FaCog,
  FaMoneyBillWave,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  exact?: boolean;
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

function NavLink({ href, children, icon, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);

  return (
    <Link href={href}>
      <div
        className={`flex items-center px-6 py-3 cursor-pointer
        ${
          isActive
            ? "bg-gray-700 text-white border-r-4 border-blue-500"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="mx-1">{children}</span>
      </div>
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  icon,
  exact = false,
  onClick,
}: MobileNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`flex items-center px-4 py-3 cursor-pointer
        ${
          isActive
            ? "bg-gray-700 text-white border-l-4 border-blue-500"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="mx-1">{children}</span>
      </div>
    </Link>
  );
}

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
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white shadow-lg fixed h-full z-10">
          <div className="flex items-center justify-center h-20 shadow-md border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Uhai Centre Admin</h1>
          </div>
          <nav className="mt-5">
            <NavLink href="/admin" exact icon={<FaTachometerAlt />}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/sermons" icon={<FaVideo />}>
              Sermons
            </NavLink>
            <NavLink href="/admin/prayer" icon={<FaPray />}>
              Prayer Requests
            </NavLink>
            <NavLink href="/admin/events" icon={<FaCalendarAlt />}>
              Events
            </NavLink>
            <NavLink href="/admin/blog" icon={<FaFileAlt />}>
              Blog
            </NavLink>
            <NavLink href="/admin/payments" icon={<FaMoneyBillWave />}>
              Payments
            </NavLink>
            <NavLink href="/admin/analytics" icon={<FaChartLine />}>
              Analytics
            </NavLink>
            <NavLink href="/admin/settings" icon={<FaCog />}>
              Settings
            </NavLink>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-600">
                    <FaUser className="text-white" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-200">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <button
                    onClick={() => router.push("/api/auth/signout")}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center mt-1"
                  >
                    <FaSignOutAlt className="mr-1" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile header */}
        <div className="md:hidden bg-gray-800 text-white w-full fixed top-0 z-20">
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
            <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-95 pt-16">
              <nav className="px-4 py-4 space-y-1">
                <MobileNavLink
                  href="/admin"
                  exact
                  icon={<FaTachometerAlt />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/sermons"
                  icon={<FaVideo />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sermons
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/prayer"
                  icon={<FaPray />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Prayer Requests
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/events"
                  icon={<FaCalendarAlt />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/blog"
                  icon={<FaFileAlt />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/payments"
                  icon={<FaMoneyBillWave />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Payments
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/analytics"
                  icon={<FaChartLine />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </MobileNavLink>
                <MobileNavLink
                  href="/admin/settings"
                  icon={<FaCog />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </MobileNavLink>

                <div className="pt-6 mt-6 border-t border-gray-700">
                  <button
                    onClick={() => {
                      router.push("/api/auth/signout");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-3 text-base text-red-400 hover:text-red-300"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64 p-6 mt-0 md:mt-0">{children}</div>
      </div>
    );
  }

  // Fallback - should not reach here due to the redirect
  return null;
}
