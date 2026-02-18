import { v4 as uuid } from "uuid";
import { Payment, PaymentMethod } from "../types/payment.types";
import { getSplitByIdService, releaseSettlement } from "./splits.service";
import { convertToSettlement } from "./conversion.service";
import { sendWebhook } from "./webhook.service"; //opcional, para notificar cambios a un sistema externo


const payments: Payment[] = [];

export async function registerPaymentService(
  splitId: string,
  payerId: string,
  method: PaymentMethod,
  originalAsset: string,
  originalAmount: number
) {

  // VALIDACIONES
  if (!payerId) {throw new Error("payerId is required");}
  if (!method) {throw new Error("Payment method is required");}
  if (!originalAsset) {throw new Error("originalAsset is required");}
  if (!originalAmount || originalAmount <= 0) {
    throw new Error("originalAmount must be greater than 0");
  }

  const split = await getSplitByIdService(splitId);

  if (split.status === "CANCELLED") {
  throw new Error("Split cancelled");}
  
  if (split.status === "SETTLED") {
    throw new Error("Split already settled");}

  if (split.expiresAt && new Date() > split.expiresAt) {
    throw new Error("Split expired");}

  // simular conversion
const { conversionRate, convertedAmount } =
  convertToSettlement(originalAmount, originalAsset, split.settlementAsset);

const totalPaidSoFar = payments
  .filter((p: Payment) => p.splitId === splitId)
  .reduce((sum: number, p: Payment) => sum + p.convertedAmount, 0);


const remainingGlobal = split.totalAmount - totalPaidSoFar;

//pruebas console console.log()

if (convertedAmount > remainingGlobal) {
  throw new Error("Payment exceeds remaining split amount");
}

  // FIXED: MODO LOGICO
if (split.mode === "FIXED") {
  const participant = split.participants?.find(
    (p) => p.id === payerId
  );

  if (!participant) {
    throw new Error("Payer not part of this split");
  }

  const allowedTotal =
    split.totalAmount * ((participant.share ?? 0) / 100);

  const alreadyPaidByUser = payments
    .filter(
      (p) => p.splitId === splitId && p.payerId === payerId
    )
    .reduce((sum: number, p: Payment) => sum + p.convertedAmount, 0);

  const remainingUser = allowedTotal - alreadyPaidByUser;

  if (convertedAmount > remainingUser) {
    throw new Error("Payment exceeds user's assigned share");
  }
}

  // Crear payment
const payment: Payment = {
  id: uuid(),
  splitId,
  payerId,
  method,
  originalAsset,
  originalAmount,
  conversionRate,
  convertedAmount,
  externalStatus: "CONFIRMED",
  createdAt: new Date(),
};


payments.push(payment);

const updatedSplit = await getSplitByIdService(splitId);

if (updatedSplit.webhookUrl) {
  await sendWebhook(updatedSplit.webhookUrl, {
    event: "SPLIT_UPDATED",
    splitId: updatedSplit.id,
    status: updatedSplit.status,
  });
}

if (updatedSplit.status === "READY_FOR_SETTLEMENT") {
  await releaseSettlement(splitId);
}

 return {
  payment,
  updatedSplit: await getSplitByIdService(splitId),
  };
}

// Función para obtener los pagos de un split
export function getPaymentsBySplit(splitId: string): Payment[] {
  return payments.filter((p: Payment) => p.splitId === splitId);
}
