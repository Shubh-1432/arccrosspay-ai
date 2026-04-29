import { initiateSmartContractPlatformClient } from "@circle-fin/smart-contract-platform";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const apiKey = process.env.CIRCLE_API_KEY || "";
const entitySecret = process.env.ENTITY_SECRET || "";

export const scpClient = initiateSmartContractPlatformClient({
  apiKey,
  entitySecret,
});

export const walletsClient = initiateDeveloperControlledWalletsClient({
  apiKey,
  entitySecret,
});

export const USDC_ADDRESS_ARC = "0x3600000000000000000000000000000000000000";
export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";
