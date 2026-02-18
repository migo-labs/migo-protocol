import { Split, SplitInput } from "../types/split.types";
import { v4 as uuid } from "uuid";
import { getPaymentsBySplit } from "./payment.service";
import { Payment } from "../types/payment.types";
import { sendSettlementPayment } from "./stellar.service";

import { sendWebhook } from "./webhook.service";
import { PaymentIntent } from "../types/payment-intent.types";



const splits = new Map<string, Split>();


// Servicio para crear un nuevo split
export async function createSplitService(
  input: SplitInput
): Promise<Split> {
  validateSplit(input);


// Aquí se crearían los splits en la base de datos, por ahora lo hacemos en memoria
//  MOCK: generar un ID único para el split y guardar en el Map
  const split: Split = {
    id: uuid(),
    totalAmount: input.totalAmount,
    settlementAsset: input.settlementAsset,
    mode: input.mode,
    participants: input.participants ?? [],
    //paidAmount: 0,
    status: "PENDING",
    createdAt: new Date(),
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    webhookUrl: input.webhookUrl,
  };

  splits.set(split.id, split);

  return split;
}


// Servicio para obtener un split por ID
// Este servicio se usará en el controlador de QR para generar el payload del QR
export async function getSplitByIdService(id: string): Promise<Split> {
  const split = splits.get(id);
  if (!split) throw new Error("Split not found");
  if (split.expiresAt && new Date() > split.expiresAt) {
  split.status = "CANCELLED";
  splits.set(id, split);
  return split;
}
  // Si ya fue liquidado, no recalculamos nada
  if (split.status === "SETTLED") {
    return split;
}
  const payments = getPaymentsBySplit(id);

  const totalPaid = payments.reduce(
    (sum: number, p: Payment) => sum + p.convertedAmount,
    0
  );

  let derivedStatus: Split["status"] = "PENDING";

  if (totalPaid >= split.totalAmount) {
  derivedStatus = "READY_FOR_SETTLEMENT";
  } else if (totalPaid > 0) {
    derivedStatus = "PARTIAL";
  }

  split.status = derivedStatus;
  splits.set(id, split);

  return split;

}

// Servicio para obtener el estado de los participantes de un split
// Solo aplica para splits en modo FIXED, en OPEN_POOL no hay shares asignados
export async function getParticipantsStatus(splitId: string) {
  const split = await getSplitByIdService(splitId);

  if (split.mode !== "FIXED") {
    throw new Error("Participants status only applies to FIXED mode");
  }

  const payments = getPaymentsBySplit(splitId);

  return split.participants?.map((participant) => {
    const assignedAmount =
      split.totalAmount * ((participant.share ?? 0) / 100);

    const paidAmount = payments
  .filter((p: Payment) => p.payerId === participant.id)
  .reduce((sum: number, p: Payment) => sum + p.convertedAmount, 0);


    const remainingAmount = assignedAmount - paidAmount;

    return {
      participantId: participant.id,
      assignedAmount,
      paidAmount,
      remainingAmount,
      status: remainingAmount <= 0 ? "COMPLETED" : "PENDING",
    };
  });
}

// Servicio para liberar el settlement de un split
// Este servicio se llamará desde el controlador cuando se haga la petición de release
export async function releaseSettlement(splitId: string): Promise<Split> {
  const split = splits.get(splitId);
  if (!split) throw new Error("Split not found");

  if (split.status === "SETTLED") {
    throw new Error("Split already settled");
  }

  const current = await getSplitByIdService(splitId);

  if (current.status !== "READY_FOR_SETTLEMENT") {
    throw new Error("Split not ready for settlement");
  }

  // Simulamos PSP primero
  //await simulatePSPTransfer(split);
  //const amount = Number(split.totalAmount).toFixed(7);

  const txHash = await sendSettlementPayment(
  split.totalAmount.toString(),
  split.settlementAsset
);
  
  split.status = "SETTLED";
  split.releasedAt = new Date();
  split.stellarTxHash = txHash;
  
  splits.set(splitId, split);

  if (split.webhookUrl) {
    await sendWebhook(split.webhookUrl, {
      event: "SPLIT_SETTLED",
      splitId: split.id,
      status: split.status,
      totalAmount: split.totalAmount,
    });
  }

  return split;
}


async function simulatePSPTransfer(split: Split) {
  console.log("Simulating PSP transfer...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}


// Validaciones de  negocio para la creación de splits
// FIXED: cada participante debe tener un share válido y la suma de shares debe ser 100
// OPEN_POOL: los participantes son opcionales, no validamos shares

function validateSplit(input: SplitInput) {

  if (!input.totalAmount || input.totalAmount <= 0) {
    throw new Error("Invalid total amount");
  }

  if (!input.settlementAsset) {
    throw new Error("Settlement asset is required");
  }
  // Validamos que el asset tenga un código y una red
  if (
  !input.settlementAsset ||
  !input.settlementAsset.network ||
  !input.settlementAsset.code
  ) {
  throw new Error("Invalid settlement asset");
  }

  if (!input.mode) {
    throw new Error("Mode is required");
  }

  if (input.mode === "FIXED") {
    if (!input.participants || input.participants.length === 0) {
      throw new Error("Participants are required in FIXED mode");
    }
    const totalShare = input.participants.reduce(
      (sum, p) => sum + (p.share ?? 0),
      0
    );

    if (totalShare !== 100) {
      throw new Error("Shares must sum 100 in FIXED mode");
    }

    const hasInvalidShare = input.participants.some(
      (p) => !p.share || p.share <= 0
    );

    if (hasInvalidShare) {
      throw new Error("Each participant must have a valid share in FIXED mode");
    }
  }

  //if (input.mode === "OPEN_POOL") {
    // En OPEN_POOL los participantes son opcionales
    // No validamos shares
  //}

}


export async function getPaymentIntent(splitId: string): Promise<PaymentIntent> {
  const split = await getSplitByIdService(splitId);

  const payments = getPaymentsBySplit(splitId);

  const totalPaid = payments.reduce(
    (sum: number, p: Payment) => sum + p.convertedAmount,
    0
  );

  const remainingAmount = split.totalAmount - totalPaid;

  let intentStatus: "PENDING" | "PARTIAL" | "READY_FOR_SETTLEMENT" | "SETTLED";

  if (split.status === "SETTLED") {
    intentStatus = "SETTLED";
  } else if (split.status === "READY_FOR_SETTLEMENT") {
    intentStatus = "READY_FOR_SETTLEMENT";
  } else if (split.status === "PARTIAL") {
    intentStatus = "PARTIAL";
  } else {
    intentStatus = "PENDING";
  }

  return {
    splitId: split.id,
    amount: split.totalAmount,
    remainingAmount,
    settlementAsset: split.settlementAsset,
    status: intentStatus,
    expiresAt: split.expiresAt,
    memo: `MIGO_SPLIT_${split.id}`,
  };
}


export async function cancelSplitService(splitId: string): Promise<Split> {
  const split = splits.get(splitId);
  if (!split) throw new Error("Split not found");

  if (split.status === "SETTLED") {
    throw new Error("Cannot cancel a settled split");
  }

  split.status = "CANCELLED";
  splits.set(splitId, split);

  return split;
}