import { Split } from "../types/split.types";

export function buildSplitQRPayload(split: Split) {
  return {
    type: "MIGO_SPLIT_REQUEST",
    splitId: split.id,
    totalAmount: split.totalAmount,
    settlementAsset: split.settlementAsset,
    mode: split.mode,
    status: split.status,
    createdAt: split.createdAt,
  };
}