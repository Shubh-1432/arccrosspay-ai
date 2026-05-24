"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Clock,
  Copy,
} from "lucide-react";

interface PaymentRequest {
  id: string;
  amount: string;
  description: string;
  recipientAddress: string;
  status: "pending" | "processing" | "paid" | "failed";
  txHash?: string;
  createdAt: number;
}

export default function Dashboard() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    recipientAddress: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setRequests(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ amount: "", description: "", recipientAddress: "" });
        setShowCreate(false);
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to create request", err);
    }
  };

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1800);
  };

  const totalPaid = requests
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const paidCount = requests.filter((r) => r.status === "paid").length;

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.35),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_30%)]" />

      <div className="relative max-w-6xl mx-auto px-5 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 mb-4">
              <Wallet size={14} />
              Arc Testnet · USDC Payments
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              ArcCrossPay
            </h1>

            <p className="text-zinc-400 mt-3 max-w-xl">
              Create USDC payment links, share them with clients, and track
              on-chain payments in one clean dashboard.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition"
          >
            <Plus size={20} />
            Create Request
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-zinc-400">Total Paid</p>
            <h2 className="text-3xl font-bold mt-2">{totalPaid} USDC</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-zinc-400">Paid Requests</p>
            <h2 className="text-3xl font-bold mt-2">{paidCount}</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-zinc-400">Pending Requests</p>
            <h2 className="text-3xl font-bold mt-2">{pendingCount}</h2>
          </div>
        </section>

        {showCreate && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 mb-8 shadow-2xl">
            <h2 className="text-xl font-semibold mb-1">New payment request</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Add invoice details and generate a shareable payment link.
            </p>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-indigo-400"
                  placeholder="e.g. Website design payment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-indigo-400"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Recipient wallet
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipientAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientAddress: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-indigo-400"
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-2xl px-5 py-3 text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
                >
                  Generate Link
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div>
              <h2 className="text-lg font-semibold">Payment requests</h2>
              <p className="text-sm text-zinc-400">
                Track invoices and share payment links.
              </p>
            </div>

            <button
              onClick={fetchRequests}
              className="rounded-xl p-3 hover:bg-white/10"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {requests.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="mx-auto mb-4 text-zinc-500" size={42} />
                <p className="text-zinc-400">No payment requests yet.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {req.description}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          req.status === "paid"
                            ? "bg-green-500/15 text-green-400"
                            : req.status === "failed"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-yellow-500/15 text-yellow-400"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-2xl font-bold">{req.amount} USDC</p>

                    <p className="text-xs text-zinc-500 mt-2">
                      {req.recipientAddress.slice(0, 8)}...
                      {req.recipientAddress.slice(-6)} ·{" "}
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(req.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-indigo-300 hover:bg-indigo-500/25"
                    >
                      {copiedId === req.id ? (
                        <>
                          <CheckCircle2 size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Link
                        </>
                      )}
                    </button>

                    <a
                      href={`/pay/${req.id}`}
                      target="_blank"
                      className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                    >
                      <ExternalLink size={18} />
                    </a>

                    {req.txHash && (
                      <a
                        href={`https://testnet.arcscan.app/tx/${req.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                      >
                        <LinkIcon size={18} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}                     
             
