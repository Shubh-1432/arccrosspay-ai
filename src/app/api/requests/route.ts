import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  const keys = await redis.keys('*')
  const values = await Promise.all(keys.map((key) => redis.get(key)))
  return NextResponse.json(values)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, recipientAddress } = body;

    if (!amount || !description || !recipientAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRequest = {
      id: uuidv4(),
      amount,
      description,
      recipientAddress,
      status: 'pending' as const,
      createdAt: Date.now(),
    };

    await redis.set(newRequest.id, newRequest);

    return NextResponse.json(newRequest);  
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

