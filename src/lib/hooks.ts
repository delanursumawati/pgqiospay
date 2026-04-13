/**
 * Custom React hook for CSRF token management
 * Fetches a new CSRF token before form submissions
 */
"use client";

import { useState, useCallback } from "react";

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchCsrfToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/csrf");
      const data = await res.json();
      setCsrfToken(data.csrfToken);
      return data.csrfToken;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  return { csrfToken, fetchCsrfToken, loading };
}
