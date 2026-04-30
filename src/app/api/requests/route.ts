import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  try {
    const keys = await redis.keys('*')
    const values = await Promise.all(keys.map((key) => redis.get(key)))
    return NextResponse.json(values)
  } catch (error) {
    return NextResponse.json({ error: 'GET failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, description, recipientAddress } = body

    if (!amount || !description || !recipientAddress) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const newRequest = {
      id: uuidv4(),
      amount,
      description,
      recipientAddress,
      status: 'pending',
      createdAt: Date.now(),
    }

    await redis.set(newRequest.id, newRequest)

    return NextResponse.json(newRequest)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'POST failed' },
      { status: 500 }
    )
  }
}
