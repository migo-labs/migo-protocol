import { Payment, PaymentMethod } from "../types/payment.types";
import { getSplitByIdService, releaseSettlement } from "./splits.service";
import { convertToSettlement } from "./conversion.service";
import { sendWebhook } from "./webhook.service";
import { prisma } from "../lib/prisma";

export async function registerPaymentService(
    splitId: string,
    payerId: string,
    method: PaymentMethod,
    originalAsset: string,
    originalAmount: number
) {
    if (!payerId) throw new Error("payerId is required");
    if (!method) throw new Error("Payment method is required");
    if (!originalAsset) throw new Error("originalAsset is required");
    if (!originalAmount || originalAmount <= 0) throw new Error("originalAmount must be greater than 0");

    const split = await getSplitByIdService(splitId);

    if (split.status === "CANCELLED") throw new Error("Split cancelled");
    if (split.status === "SETTLED") throw new Error("Split already settled");
    if (split.expiresAt && new Date() > split.expiresAt) throw new Error("Split expired");

    const { conversionRate, convertedAmount } = await convertToSettlement(
    originalAmount, originalAsset, split.settlementAsset
);

    // Verificar que no exceda el monto restante
    const existingPayments = await prisma.payment.findMany({ where: { splitId } });
    const totalPaidSoFar = existingPayments.reduce((sum, p) => sum + p.convertedAmount, 0);
    const remainingGlobal = split.totalAmount - totalPaidSoFar;

    if (convertedAmount > remainingGlobal) throw new Error("Payment exceeds remaining split amount");

    // Guardar en Postgres
    const payment = await prisma.payment.create({
    data: {
        splitId,
        payerId,
        method,
        originalAsset,
        originalAmount,
        conversionRate,
        convertedAmount,
        externalStatus: "CONFIRMED",
    },
    });

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

    export async function getPaymentsBySplit(splitId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({ where: { splitId } });
    return payments as unknown as Payment[];
}