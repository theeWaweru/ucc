"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when component mounts
    trackPageView(pathname);
  }, [pathname]);

  return null; // This component doesn't render anything
}
