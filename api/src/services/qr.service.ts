import { Split } from "../types/split.types";
import { PaymentIntent } from "../types/payment-intent.types";
import QRCode from "qrcode";

// qr interno para generar el payload del QR a partir de un split
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

// qr wallet-compatible para generar el payload del QR que pueda ser leído por wallets compatibles con el estándar de Stellar (SEP-7)
export function buildStellarPaymentURI(
  intent: PaymentIntent,
  merchantPublic: string
): string {
  const base = `web+stellar:pay?destination=${merchantPublic}&amount=${intent.remainingAmount}`;

  if (intent.settlementAsset.type === "native") {
    return `${base}&asset_code=XLM&memo=${intent.memo}`;
  }

  if (intent.settlementAsset.type === "credit") {
    return `${base}&asset_code=${intent.settlementAsset.code}&asset_issuer=${intent.settlementAsset.issuer}&memo=${intent.memo}`;
  }

  throw new Error("Unsupported asset type");
}

// Función para generar un QR code a partir de un string (puede ser el payload del split o la URI de pago)
export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data);
}
