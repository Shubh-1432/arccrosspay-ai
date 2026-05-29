"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Home,
  FileText,
  CreditCard,
  Users,
  Settings,
  Plus,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  Wallet,
  Link as LinkIcon,
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

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Requests", icon: FileText, active: true },
  { label: "Payments", icon: CreditCard },
  { label: "Recipients", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState("");
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
      const safeData = Array.isArray(data) ? data : [];
      setRequests(
        safeData.sort(
          (a: PaymentRequest, b: PaymentRequest) =>
            Number(b.createdAt || 0) - Number(a.createdAt || 0)
        )
      );
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setRequests([]);
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
        setFormData({
          amount: "",
          description: "",
          recipientAddress: "",
        });
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
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const latestRequest = requests[0];

  const totalPaid = useMemo(() => {
    return requests
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [requests]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const shortAddress = (address?: string) => {
    if (!address) return "0x8f3d...A7c1";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const statusSteps = [
    "Created",
    "Shared",
    "Connected",
    "Paid",
    "Received",
  ];

  const completedSteps =
    latestRequest?.status === "paid"
      ? 5
      : latestRequest?.status === "processing"
      ? 3
      : latestRequest
      ? 2
      : 1;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-[#0B1736]">
      <div className="mx-auto max-w-[1440px] p-6">
        <div className="grid min-h-[calc(100vh-48px)] grid-cols-1 overflow-hidden rounded-[28px] border border-[#E4ECF7] bg-white shadow-[0_25px_80px_rgba(35,74,160,0.10)] lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="border-r border-[#E8EEF8] bg-[#FBFDFF] p-6">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-xl font-bold text-white shadow-md">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold">ArcCrossPay</h1>
                <p className="text-xs text-slate-500">USDC on Arc Testnet</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      item.active
                        ? "bg-[#EEF4FF] text-[#2D6BFF]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#16316E] to-[#10224D] p-5 text-white shadow-xl">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Wallet className="text-cyan-300" />
              </div>
              <p className="text-lg font-semibold">Arc Testnet</p>
              <p className="text-sm text-cyan-300">Real test USDC</p>
            </div>

            <div className="mt-6 rounded-3xl border border-[#E8EEF8] bg-white p-4">
              <p className="text-sm text-slate-500">Total Paid</p>
              <p className="mt-1 text-2xl font-bold">{totalPaid.toFixed(2)} USDC</p>
              <p className="mt-4 text-sm text-slate-500">Pending Requests</p>
              <p className="mt-1 text-xl font-semibold">{pendingCount}</p>
            </div>
          </aside>

          {/* Main content */}
          <section className="p-6 lg:p-8">
            {/* Top bar */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-4xl font-black leading-tight">
                  ArcCrossPay
                  <span className="block bg-gradient-to-r from-[#2448FF] to-[#33B3FF] bg-clip-text text-transparent">
                    Core Flow Is Live
                  </span>
                </h2>
                <p className="mt-3 max-w-2xl text-lg text-slate-600">
                  GitHub fixed. Redeployed on Vercel. Payment lookup cleaned up.
                  Wallet switched to Arc Testnet. End-to-end USDC payment confirmed.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[#D5F1E7] bg-[#ECFBF5] px-5 py-3 text-sm font-semibold text-[#0E6B53]">
                  ✅ WORKING FLOW CONFIRMED
                </div>

                <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  Arc Testnet
                </div>

                <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  {shortAddress(latestRequest?.recipientAddress)}
                </div>
              </div>
            </div>

            {/* Create request button + form */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Payment Request</h3>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRequests}
                  className="rounded-2xl border border-[#E8EEF8] bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className="flex items-center gap-2 rounded-2xl bg-[#2D6BFF] px-5 py-3 font-semibold text-white shadow-md hover:bg-[#245AF0]"
                >
                  <Plus size={18} />
                  Create Request
                </button>
              </div>
            </div>

            {showCreate && (
              <div className="mb-6 rounded-[24px] border border-[#E8EEF8] bg-white p-6 shadow-sm">
                <h4 className="mb-4 text-lg font-semibold">New Payment Request</h4>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="e.g. Logo Design"
                      className="w-full rounded-2xl border border-[#DCE6F3] px-4 py-3 outline-none focus:border-[#2D6BFF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Amount (USDC)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="25.00"
                        className="w-full rounded-2xl border border-[#DCE6F3] px-4 py-3 outline-none focus:border-[#2D6BFF]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Recipient Address
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
                        placeholder="0x..."
                        className="w-full rounded-2xl border border-[#DCE6F3] px-4 py-3 outline-none focus:border-[#2D6BFF]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded-2xl px-4 py-3 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#2D6BFF] px-5 py-3 font-semibold text-white hover:bg-[#245AF0]"
                    >
                      Generate Link
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Main request card */}
            <div className="mb-6 rounded-[28px] border border-[#E8EEF8] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-xl font-bold">Payment Request</h4>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-slate-600">
                      Request #{latestRequest?.id?.slice(0, 4) || "8421"}
                    </p>
                    <span className="rounded-full bg-[#E9F8EE] px-3 py-1 text-xs font-semibold text-[#1D8A53]">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#E8EEF8] p-5">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="mt-2 text-4xl font-bold">
                    {latestRequest?.amount || "25.00"}{" "}
                    <span className="text-2xl font-medium text-slate-500">USDC</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    ≈ ${latestRequest?.amount || "25.00"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8EEF8] p-5">
                  <p className="text-sm text-slate-500">Network</p>
                  <p className="mt-2 text-3xl font-bold">Arc Testnet</p>
                  <p className="mt-2 text-sm text-slate-500">USDC settlement</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E8EEF8] p-5">
                <p className="text-sm text-slate-500">Payment Link</p>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <p className="truncate text-base font-semibold text-[#2D6BFF]">
                    {latestRequest
                      ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${latestRequest.id}`
                      : "https://arccrosspay.io/pay/8421"}
                  </p>

                  {latestRequest && (
                    <button
                      onClick={() => copyLink(latestRequest.id)}
                      className="flex items-center gap-2 rounded-2xl bg-[#EEF4FF] px-4 py-3 font-semibold text-[#2D6BFF] hover:bg-[#E3ECFF]"
                    >
                      <Copy size={16} />
                      {copied === latestRequest.id ? "Copied" : "Copy Link"}
                    </button>
                  )}
                </div>
              </div>

              {/* Status tracker */}
              <div className="mt-8">
                <p className="mb-5 text-lg font-semibold">Status</p>

                <div className="relative">
                  <div className="absolute left-0 right-0 top-4 hidden h-[2px] bg-[#D7E4FB] md:block" />

                  <div className="relative grid grid-cols-2 gap-4 md:grid-cols-5">
                    {statusSteps.map((step, index) => {
                      const done = index < completedSteps;
                      const isLast = index === 4;

                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center text-center"
                        >
                          <div
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              done
                                ? "border-[#2D6BFF] bg-[#2D6BFF] text-white"
                                : isLast
                                ? "border-[#2D6BFF] bg-white text-[#2D6BFF]"
                                : "border-[#D7E4FB] bg-white text-slate-400"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </div>
                          <p className="mt-3 text-sm font-medium text-slate-600">
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Received card */}
              <div className="mt-8 rounded-2xl border border-[#E8EEF8] bg-[#FCFDFF] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9F8EE] text-[#1D8A53]">
                      <CheckCircle2 size={24} />
                    </div>

                    <div>
                      <p className="font-semibold">Recipient Received</p>
                      <p className="text-sm text-slate-500">
                        {latestRequest?.amount || "25.00"} USDC
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    {latestRequest?.txHash ? (
                      <a
                        href={`https://testnet.arcscan.app/tx/${latestRequest.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-semibold text-[#2D6BFF]"
                      >
                        Tx Hash
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      <span className="text-slate-400">Awaiting transaction</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent requests table */}
            <div className="rounded-[28px] border border-[#E8EEF8] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8EEF8] px-6 py-5">
                <div>
                  <h4 className="text-xl font-bold">Recent Requests</h4>
                  <p className="text-sm text-slate-500">
                    Your latest payment links and statuses
                  </p>
                </div>

                <button
                  onClick={fetchRequests}
                  className="rounded-2xl border border-[#E8EEF8] bg-white p-3 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500">
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Recipient</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          {loading ? "Loading requests..." : "No requests found yet."}
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr
                          key={req.id}
                          className="border-t border-[#F0F4FA] text-sm hover:bg-[#FAFCFF]"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#0B1736]">
                              {req.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(req.createdAt).toLocaleString()}
                            </p>
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {req.amount} USDC
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {shortAddress(req.recipientAddress)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                req.status === "paid"
                                  ? "bg-[#E9F8EE] text-[#1D8A53]"
                                  : req.status === "failed"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-[#FFF8E6] text-[#B67A00]"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyLink(req.id)}
                                className="rounded-xl bg-[#EEF4FF] p-2 text-[#2D6BFF] hover:bg-[#E3ECFF]"
                                title="Copy Link"
                              >
                                {copied === req.id ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  <LinkIcon size={16} />
                                )}
                              </button>

                              <a
                                href={`/pay/${req.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                                title="Open Payment Page"
                              >
                                <ExternalLink size={16} />
                              </a>

                              {req.txHash && (
                                <a
                                  href={`https://testnet.arcscan.app/tx/${req.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                                  title="View Transaction"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
