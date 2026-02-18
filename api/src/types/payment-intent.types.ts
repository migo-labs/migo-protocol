import { AssetConfig } from "./asset.types";

export interface PaymentIntent {
  splitId: string;
  amount: number;
  remainingAmount: number;
  settlementAsset: AssetConfig;
  status: "PENDING" | "PARTIAL" | "READY_FOR_SETTLEMENT" | "SETTLED";
  expiresAt?: Date;
  memo: string;
}
