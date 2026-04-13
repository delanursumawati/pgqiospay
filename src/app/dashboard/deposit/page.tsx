/**
 * Deposit Page
 * Create deposit tickets and view transaction history
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useCsrf } from "@/lib/hooks";

interface Ticket {
  id: string;
  amount: string;
  uniqueCode: number;
  totalAmount: string;
  status: string;
  refId: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function DepositPage() {
  const { fetchCsrfToken } = useCsrf();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      console.error("Failed to load tickets");
    }
  }, []);

  useEffect(() => {
    loadTickets();
    // Auto-refresh tickets every 30 seconds
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, [loadTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const csrfToken = await fetchCsrfToken();
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), csrfToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create ticket");
        return;
      }

      setSuccess(
        `Ticket created! Transfer exactly ${formatCurrency(data.ticket.totalAmount)} within 10 minutes.`
      );
      setAmount("");
      loadTickets();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "EXPIRED":
        return "bg-gray-100 text-gray-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRemainingTime = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return "Expired";
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const presetAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deposit</h1>
        <p className="text-gray-500 mt-1">
          Top up your balance via QRIS payment
        </p>
      </div>

      {/* Create Ticket Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Create Deposit Ticket
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (IDR)
            </label>
            <input
              type="number"
              placeholder="Enter amount (min Rp 10.000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={10000}
              max={50000000}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition"
            />
          </div>

          {/* Preset amounts */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  amount === String(preset)
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Generate Deposit Ticket"}
          </button>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> A small unique code will be added to your
            deposit amount. Please transfer the exact total amount shown. The
            ticket is valid for 10 minutes only.
          </p>
        </div>
      </div>

      {/* Ticket History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Ticket History
          </h2>
          <button
            onClick={loadTickets}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Refresh
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No deposit tickets yet. Create one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Transfer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ref ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(ticket.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      +{ticket.uniqueCode}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {formatCurrency(ticket.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {ticket.status === "PENDING"
                        ? getRemainingTime(ticket.expiresAt)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {ticket.refId || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
