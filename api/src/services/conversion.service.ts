import { AssetConfig } from "../types/asset.types";

const HORIZON_URL = process.env.STELLAR_NETWORK === "mainnet"
  ? process.env.STELLAR_HORIZON_URL_MAINNET ?? "https://horizon.stellar.org"
  : process.env.STELLAR_HORIZON_URL_TESTNET ?? "https://horizon-testnet.stellar.org";

// tasa real desde stellar dex

export async function getLiveConversionRate(
  fromAsset: string,
  toAsset: string,
  amount: number
): Promise<number> {
  // si es el mismo asset, no hay conversion
  if (fromAsset === toAsset) return 1;

  //construir parametros segun el tipo de asset
  const getAssetParams = (asset: string, prefix: string) => {
    if (asset === "XLM") {
      return `${prefix}_asset_type=native`;
    }
    // usdc y otros asssets de credicto
    return `${prefix}_asset_type=credit_alphanum4` +
          `&${prefix}_asset_code=${asset}` +
          `&${prefix}_asset_issuer=${process.env.ISSUER_PUBLIC_ASSET}`
  }

  const url = `${HORIZON_URL}/paths/strict-receive?` +
              `${getAssetParams(fromAsset, "source")}` +
              `&${getAssetParams(toAsset, "destination")}` +
              `&destination_amount=${amount}` +
              `&source_account=${process.env.ISSUER_PUBLIC}`
  console.log("URL Horizon:", url);
  const response = await fetch(url);

  if (!response.ok){
    throw new Error(
      `Horizon no disponible: ${response.status}`
    );
  }

  const data = await response.json();
  if (!data._embedded?.records?.length) {
    throw new Error (
      `No hay ruta de conversión entre ${fromAsset} y ${toAsset}`
    );
  }
  const bestPath = data._embedded.records[0];
  const rate = Number(bestPath.destination_amount) /
              Number(bestPath.source_amount);
  return rate;
}

// TODO: reemplazar con rates reales cuando se integren ARS/BRL on-chain
export function getMockConversionRate(asset: string): number {
  const rates: Record<string, number> = {
    USDC: 1,
    XLM: 1,
    ARS_BANK: 0.002,
    BRL_BANK: 0.18,
  };

  return rates[asset] ?? 1;
}

//conversion principal
export async function convertToSettlement(
  originalAmount: number,
  originalAsset: string,
  settlementAsset: AssetConfig
) {// Si es la misma moneda → no convertir
  if (originalAsset === settlementAsset.code) {
    return {
      conversionRate: 1,
      convertedAmount: originalAmount,
    }
  }
  try {
    const rate = await getLiveConversionRate(
      originalAsset, settlementAsset.code, originalAmount
    );
    return { conversionRate: rate, convertedAmount: originalAmount * rate, };
  }  catch (err){ 
    console.error(`[Conversion] Horizon falló: ${err}`);
    throw new Error(`No se pudo obtener tasa de conversión: ${err}`);

  }
}

