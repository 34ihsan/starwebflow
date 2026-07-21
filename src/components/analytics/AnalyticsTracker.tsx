"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip tracking for admin routes
    if (!pathname || pathname.startsWith("/admin")) return;

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    let isMounted = true;
    startTimeRef.current = Date.now();

    const sendPageView = async () => {
      try {
        const res = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "pageview",
            path: fullPath,
            title: typeof document !== "undefined" ? document.title : "",
            referrer: typeof document !== "undefined" ? document.referrer : "",
          }),
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.pageViewId) {
            activePageViewIdRef.current = data.pageViewId;
          }
        }
      } catch (err) {
        console.error("Failed to log page view:", err);
      }
    };

    sendPageView();

    // Periodic heartbeat every 10 seconds to update duration
    intervalRef.current = setInterval(() => {
      if (activePageViewIdRef.current && startTimeRef.current) {
        const durationInSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (durationInSeconds > 0) {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "heartbeat",
              pageViewId: activePageViewIdRef.current,
              duration: durationInSeconds,
            }),
          }).catch(() => {});
        }
      }
    }, 10000);

    const handleBeforeUnload = () => {
      if (activePageViewIdRef.current && startTimeRef.current) {
        const durationInSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (durationInSeconds > 0) {
          const payload = JSON.stringify({
            action: "heartbeat",
            pageViewId: activePageViewIdRef.current,
            duration: durationInSeconds,
          });
          
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon("/api/analytics/track", blob);
          } else {
            fetch("/api/analytics/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              keepalive: true,
            }).catch(() => {});
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, searchParams]);

  return null;
}
