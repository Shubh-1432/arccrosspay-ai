"use client";

import { useState, useEffect } from "react";
import { Plus, Link as LinkIcon, ExternalLink, RefreshCw } from "lucide-react";

interface PaymentRequest {
  id: string;
  amount: string;
  description: string;
  recipientAddress: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  txHash?: string;
  createdAt: number;
}

export default function Dashboard() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
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

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    alert("Payment link copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">ArcCrossPay</h1>
            <p className="text-gray-600 dark:text-gray-400">Freelancer Payment Dashboard</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Create Request
          </button>
        </header>

        {showCreate && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-8">
            <h2 className="text-xl font-semibold mb-4">New Payment Request</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  placeholder="e.g. Logo Design"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (USDC)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Address (Arc)</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientAddress}
                    onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                    className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="0x..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Your Requests</h2>
            <button onClick={fetchRequests} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No payment requests yet. Create your first one to get started!
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{req.description}</h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{req.amount} USDC</span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                      req.status === 'paid' ? 'bg-green-100 text-green-700' :
                      req.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                    <button
                      onClick={() => copyLink(req.id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Copy Link"
                    >
                      <LinkIcon size={18} />
                    </button>
                    {req.txHash && (
                      <a
                        href={`https://testnet.arcscan.app/tx/${req.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        title="View on Explorer"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
