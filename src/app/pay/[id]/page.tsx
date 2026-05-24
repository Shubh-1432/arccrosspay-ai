"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createWalletClient, custom, parseUnits, encodeFunctionData } from "viem";
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
  fetch(`/api/requests`)
    .then((res) => res.json())
    .then((data) => {
      const found = data.find((r: any) => r.id === id);

      if (!found) {
        setError("Request not found");
        return;
      }

      setRequest(found);

      if (found.status === "paid") {
        setStatus("paid");
      }
    });
}, [id]);

  // ✅ LOADING UI (ONLY ONE)
  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // ✅ CONNECT WALLET
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask.");
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

  // ✅ HANDLE PAYMENT
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

      const amountRaw = parseUnits(String(request.amount || "0"), 6);

      const hash = await walletClient.sendTransaction({
        to: USDC_ADDRESS,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [request.recipientAddress, amountRaw],
        }),
      });

      setTxHash(hash);
      setStatus("verifying");

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">ArcCrossPay</h1>
          <p className="text-gray-500">Payment Request</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-gray-500">{request.description}</p>
          <p className="text-3xl font-bold">
            {request.amount} USDC
          </p>
        </div>

        {status === "paid" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-xl font-bold">Payment Successful</h2>

            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                className="text-indigo-600 underline mt-2 block"
              >
                View Transaction <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">

            {!account ? (
              <button
                onClick={connectWallet}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl"
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <p className="text-sm text-center">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>

                <button
                  onClick={handlePay}
                  className="w-full bg-green-600 text-white py-3 rounded-xl"
                >
                  Pay with USDC
                </button>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
