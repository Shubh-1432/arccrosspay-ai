"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Copy,
  FileText,
  Send,
  DollarSign,
  Settings,
  Home,
  ListChecks,
  Sparkles,
  BadgeCheck,
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

      const safeData = Array.isArray(data) ? data : [];

      setRequests(
        safeData.sort((a: PaymentRequest, b: PaymentRequest) => {
          return Number(b.createdAt || 0) - Number(a.createdAt || 0);
        })
      );
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
    setTimeout(() => setCopiedId(""), 1600);
  };

  const totalPaid = requests
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const latestRequest = requests[0];

  const flowSteps = [
    {
      title: "Create request",
      sub: "Set amount & details",
      icon: FileText,
    },
    {
      title: "Share payment link",
      sub: "Send to payer",
      icon: LinkIcon,
    },
    {
      title: "Connect wallet",
      sub: "Payer connects wallet",
      icon: Wallet,
    },
    {
      title: "Pay USDC",
      sub: "On Arc Testnet",
      icon: DollarSign,
    },
    {
      title: "Recipient receives funds",
      sub: "Payment complete",
      icon: CheckCircle2,
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7FAFF] text-[#07122F]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-blue-500/20">
              <span className="text-2xl font-black">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ArcCrossPay</h1>
              <p className="text-xs text-slate-500">USDC payment links on Arc</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm md:flex">
            <BadgeCheck className="text-blue-600" size={20} />
            WORKING FLOW CONFIRMED
          </div>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.25fr]">
          <div>
            <h2 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              ArcCrossPay
              <span className="block bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Core Flow Is Live
              </span>
            </h2>

            <div className="mt-8 space-y-2 text-xl font-medium text-slate-700">
              <p>GitHub fixed. Redeployed on Vercel.</p>
              <p>Payment lookup cleaned up.</p>
              <p>Wallet switched to Arc Testnet.</p>
              <p>End-to-end USDC payment confirmed.</p>
            </div>

            <div className="mt-8 space-y-3">
              {flowSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex max-w-sm items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <Icon className="text-blue-600" size={28} />

                    <div>
                      <p className="font-bold">{step.title}</p>
                      <p className="text-sm text-slate-500">{step.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-[#142345] px-5 py-4 text-white shadow-2xl shadow-blue-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Sparkles className="text-cyan-300" />
              </div>
              <div>
                <p className="font-bold">Arc Testnet</p>
                <p className="text-sm text-cyan-300">Real test USDC</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -bottom-10 right-10 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="rotate-[-2deg] rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-[0_40px_100px_rgba(15,23,42,0.25)]">
              <div className="rounded-[1.4rem] bg-white p-4">
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="rounded-full bg-white px-4 py-1 text-xs text-slate-500 shadow-sm">
                    app.arccrosspay.io
                  </div>
                  <div className="text-xs font-semibold text-slate-400">Live</div>
                </div>

                <div className="grid min-h-[520px] grid-cols-[170px_1fr] overflow-hidden rounded-2xl border border-slate-200">
                  <aside className="bg-slate-50 p-5">
                    <div className="mb-8 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white">
                        A
                      </div>
                      <p className="font-bold">ArcCrossPay</p>
                    </div>

                    <nav className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2">
                        <Home size={16} />
                        Dashboard
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 font-semibold text-blue-700">
                        <ListChecks size={16} />
                        Requests
                      </div>
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2">
                        <DollarSign size={16} />
                        Payments
                      </div>
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2">
                        <Wallet size={16} />
                        Recipients
                      </div>
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2">
                        <Settings size={16} />
                        Settings
                      </div>
                    </nav>
                  </aside>

                  <section className="p-7">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Payment Request</h3>
                        <p className="text-sm text-slate-500">
                          Request #{latestRequest?.id?.slice(0, 4) || "8421"}{" "}
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                          Arc Testnet
                        </span>
                        <button
                          onClick={() => setShowCreate(true)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          New
                        </button>
                      </div>
                    </div>

                    {showCreate ? (
                      <form
                        onSubmit={handleCreate}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <h4 className="mb-4 font-bold">Create request</h4>

                        <div className="space-y-3">
                          <input
                            required
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Description"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                          />

                          <input
                            required
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                amount: e.target.value,
                              })
                            }
                            placeholder="Amount USDC"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                          />

                          <input
                            required
                            value={formData.recipientAddress}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                recipientAddress: e.target.value,
                              })
                            }
                            placeholder="Recipient wallet 0x..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Generate Link
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="grid grid-cols-2 divide-x divide-slate-200">
                            <div>
                              <p className="text-sm text-slate-500">Amount</p>
                              <p className="mt-2 text-2xl font-bold">
                                {latestRequest?.amount || "25.00"}{" "}
                                <span className="text-base font-medium text-slate-500">
                                  USDC
                                </span>
                              </p>
                            </div>

                            <div className="pl-6">
                              <p className="text-sm text-slate-500">Network</p>
                              <p className="mt-2 text-2xl font-bold">
                                Arc Testnet
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                              Payment Link
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="truncate text-sm font-semibold text-blue-700">
                                /pay/{latestRequest?.id || "8421"}
                              </p>

                              {latestRequest && (
                                <button
                                  onClick={() => copyLink(latestRequest.id)}
                                  className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                                >
                                  <Copy size={15} />
                                  {copiedId === latestRequest.id
                                    ? "Copied"
                                    : "Copy Link"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <p className="mb-4 font-bold">Status</p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            {["Created", "Shared", "Connected", "Paid", "Received"].map(
                              (step, index) => (
                                <div
                                  key={step}
                                  className="flex flex-col items-center gap-2"
                                >
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                      index < 4
                                        ? "bg-blue-600 text-white"
                                        : "border border-blue-600 text-blue-600"
                                    }`}
                                  >
                                    {index < 4 ? "✓" : ""}
                                  </div>
                                  <span>{step}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <CheckCircle2 size={22} />
                              </div>
                              <div>
                                <p className="font-bold">Recipient Received</p>
                                <p className="text-sm text-slate-500">
                                  {latestRequest?.amount || "25.00"} USDC
                                </p>
                              </div>
                            </div>

                            {latestRequest?.txHash ? (
                              <a
                                href={`https://testnet.arcscan.app/tx/${latestRequest.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-semibold text-blue-700"
                              >
                                Tx Hash <ExternalLink size={15} />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Awaiting tx
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-14 right-20 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 text-6xl font-bold text-white shadow-2xl shadow-blue-500/30">
              $
            </div>
          </div>
        </section>

        <div className="mt-16 flex items-center gap-4 rounded-3xl bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Sparkles />
          </div>
          <p className="text-xl text-slate-700">
            Now polishing the <span className="font-bold text-blue-700">dashboard</span>,{" "}
            payment page, and overall{" "}
            <span className="font-bold text-blue-700">fintech feel</span>.
          </p>
        </div>
      </div>
    </main>
  );
}
