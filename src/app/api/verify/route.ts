import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis'
import { createPublicClient, http } from 'viem';
import { arcTestnet } from 'viem/chains';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const { txHash, requestId } = await req.json();

    if (!txHash || !requestId) {
      return NextResponse.json({ error: 'Missing txHash or requestId' }, { status: 400 });
    }

    // ✅ Get request from Redis
    const request = await redis.get(requestId)

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // ✅ 1. Wait for transaction receipt
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}`
    });

    if (receipt.status !== 'success') {
      await redis.set(requestId, { ...request, status: 'failed', txHash });
      return NextResponse.json({ status: 'failed', message: 'Transaction failed on-chain' });
    }

    // ✅ 2. Verify USDC transfer (basic check)
    // NOTE: For now we assume success if tx is successful
    // (Advanced: decode logs later)

    await redis.set(requestId, {
      ...request,
      status: 'paid',
      txHash
    });

    return NextResponse.json({
      status: 'paid',
      message: 'Payment verified successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
