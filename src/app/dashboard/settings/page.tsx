/**
 * Settings Page (Admin Only)
 * Manage Qiospay configuration: Merchant Name, NMID, Webhook Secret
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCsrf } from "@/lib/hooks";

export default function SettingsPage() {
  const router = useRouter();
  const { fetchCsrfToken } = useCsrf();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    merchantName: "",
    nmid: "",
    webhookSecret: "",
    allowedWebhookIps: "",
  });

  useEffect(() => {
    setLoading(true);
    // Check admin access
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        // Load current settings
        return fetch("/api/settings").then((r) => r.json());
      })
      .then((data) => {
        if (data?.settings) {
          setForm({
            merchantName: data.settings.merchant_name || "",
            nmid: data.settings.nmid || "",
            webhookSecret: data.settings.webhook_secret || "",
            allowedWebhookIps: data.settings.allowed_webhook_ips || "",
          });
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const csrfToken = await fetchCsrfToken();
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, csrfToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
        return;
      }

      setSuccess("Settings saved successfully");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure Qiospay integration and webhook settings
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Qiospay Configuration */}
          <div>
            <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-4">
              Qiospay Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={form.merchantName}
                  onChange={(e) =>
                    setForm({ ...form, merchantName: e.target.value })
                  }
                  placeholder="Your merchant/entity name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NMID (National Merchant ID)
                </label>
                <input
                  type="text"
                  value={form.nmid}
                  onChange={(e) => setForm({ ...form, nmid: e.target.value })}
                  placeholder="e.g., ID2025408537103"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Webhook Security */}
          <div>
            <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-4">
              Webhook Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret (for X-Signature validation)
                </label>
                <input
                  type="password"
                  value={form.webhookSecret}
                  onChange={(e) =>
                    setForm({ ...form, webhookSecret: e.target.value })
                  }
                  placeholder="Secret key for HMAC signature"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Webhook IPs (comma-separated, supports CIDR)
                </label>
                <input
                  type="text"
                  value={form.allowedWebhookIps}
                  onChange={(e) =>
                    setForm({ ...form, allowedWebhookIps: e.target.value })
                  }
                  placeholder="e.g., 103.56.148.0/24,103.56.149.0/24"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>

      {/* Webhook Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Webhook Endpoint
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <code className="text-sm font-mono text-blue-600">
            POST /api/callback/qiospay
          </code>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Configure this URL in your Qiospay dashboard as the callback/webhook
          endpoint. Ensure the X-Signature header and allowed IPs are properly
          configured above.
        </p>
      </div>
    </div>
  );
}
