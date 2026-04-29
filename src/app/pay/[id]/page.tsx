"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createWalletClient, custom, parseUnits, encodeFunctionData, PublicClient, createPublicClient, http } from "viem";
import { arcTestnet } from "viem/chains";
import { CheckCircle2, AlertCircle, Loader2, Wallet, ExternalLink } from "lucide-react";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export default function PaymentPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "paying" | "verifying" | "paid" | "failed">("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [account, setAccount] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRequest(data);
        if (data.status === 'paid') setStatus('paid');
      });
  }, [id]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install a browser wallet like MetaMask.");
      return;
    }
    setStatus("connecting");
    try {
      const client = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum!),
      });
      const [address] = await client.requestAddresses();
      setAccount(address);
      setStatus("idle");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handlePay = async () => {
    if (!account || !request) return;

    setStatus("paying");
    setError("");

    try {
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: custom(window.ethereum!),
      });

      const amountRaw = parseUnits(request.amount, 6);

      // Directly transfer USDC
      const hash = await walletClient.sendTransaction({
        to: USDC_ADDRESS,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [request.recipientAddress as `0x${string}`, amountRaw],
        }),
      });

      setTxHash(hash);
      setStatus("verifying");

      // Verify with backend
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash, requestId: id }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.status === "paid") {
        setStatus("paid");
      } else {
        setStatus("failed");
        setError(verifyData.error || "Verification failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Payment failed");
      setStatus("failed");
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">ArcCrossPay</h1>
          <p className="text-gray-500">Payment Request</p>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-500 text-sm mb-1">{request.description}</p>
          <p className="text-4xl font-bold tracking-tight">
            {request.amount} <span className="text-xl text-gray-500 font-medium">USDC</span>
          </p>
        </div>

        {status === "paid" ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">The payment has been verified on-chain.</p>
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-indigo-600 hover:underline"
              >
                View Transaction <ExternalLink size={16} />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!account ? (
              <button
                onClick={connectWallet}
                disabled={status === "connecting"}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {status === "connecting" ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
                Connect Wallet to Pay
              </button>
            ) : (
              <>
                <div className="text-sm text-center text-gray-500 mb-2">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button
                  onClick={handlePay}
                  disabled={status !== "idle" && status !== "failed"}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {status === "paying" || status === "verifying" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {status === "paying" ? "Confirming..." : "Verifying on Arc..."}
                    </>
                  ) : (
                    "Pay with USDC"
                  )}
                </button>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-gray-400">
            Secure cross-border payments powered by Circle & Arc Testnet
          </p>
        </div>
      </div>
    </main>
  );
}
