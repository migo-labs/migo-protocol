import { AssetConfig } from "../types/asset.types";

export function getMockConversionRate(asset: string): number {
  const rates: Record<string, number> = {
    USDC: 1,
    XLM: 1,
    ARS_BANK: 0.002,
    BRL_BANK: 0.18,
  };

  return rates[asset] ?? 1;
}

export function convertToSettlement(
  originalAmount: number,
  originalAsset: string,
  settlementAsset: AssetConfig
) {// Si es la misma moneda → no convertir
  if (originalAsset === settlementAsset.code) {
    return {
      conversionRate: 1,
      convertedAmount: originalAmount,
    };
  }

  const rate = getMockConversionRate(originalAsset);

  return {
    conversionRate: rate,
    convertedAmount: originalAmount * rate,
  };
}
