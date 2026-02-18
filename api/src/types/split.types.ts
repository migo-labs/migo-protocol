import { AssetConfig } from "./asset.types";


export type SplitMode = "FIXED" | "OPEN_POOL";

export type SplitStatus = "PENDING" | "PARTIAL" | "COMPLETED" | "READY_FOR_SETTLEMENT"
| "SETTLED" | "CANCELLED" 
;

export interface Participant {
  id: string;
  share?: number; // opcional, solo en FIXED
}

export interface Split {
  id: string;
  totalAmount: number;
  //settlementAsset: string;
  settlementAsset: AssetConfig;
  mode: SplitMode;
  participants?: Participant[];
  //paidAmount: number;
  status: SplitStatus;
  createdAt: Date;
  expiresAt?: Date;
  releasedAt?: Date;
  webhookUrl?: string; //
  stellarTxHash?: string;

}

export interface SplitInput {
  totalAmount: number;
  //settlementAsset: string;
  settlementAsset: AssetConfig;
  mode: SplitMode;
  participants?: Participant[];
  expiresAt?: string;
  webhookUrl?: string;

}