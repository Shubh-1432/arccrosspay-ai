# ArcCrossPay

ArcCrossPay is a production-ready cross-border USDC payment application built on **Arc Testnet**. It allows freelancers to create payment requests and recipients to pay them instantly using USDC, with on-chain verification.

## Features

- **Freelancer Dashboard**: Create and manage payment requests with a clean UI.
- **Shareable Links**: Generate unique links for each payment request.
- **On-chain Verification**: Automatic verification of USDC transfers on Arc Testnet using transaction receipts and logs.
- **Circle Integration**: Uses Circle Smart Contract Platform (SCP) and Developer-Controlled Wallets (DCW) for system operations.
- **Native USDC Gas**: Built on Arc, where USDC is the native gas token.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React.
- **Blockchain**: Arc Testnet.
- **Library**: Viem (for wallet interactions and verification).
- **Circle SDKs**: 
  - `@circle-fin/smart-contract-platform`
  - `@circle-fin/developer-controlled-wallets`

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up environment variables in `.env.local`:
   ```env
   CIRCLE_API_KEY=your_key
   ENTITY_SECRET=your_secret
   ```
4. Run the development server: `npm run dev`.

## How it works

1. **Create Request**: Freelancer enters amount, description, and recipient address on the dashboard.
2. **Share Link**: A unique URL (`/pay/[id]`) is generated.
3. **Pay**: The customer opens the link, connects their wallet, and sends USDC on Arc Testnet.
4. **Verify**: The backend polls the Arc Testnet for the transaction hash, verifies the USDC transfer event, and updates the payment status to "paid".
