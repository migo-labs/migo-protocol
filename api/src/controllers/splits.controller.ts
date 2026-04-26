import { Request, Response } from "express";
import { z } from "zod";
import {
  createSplitService,
  getSplitByIdService,
  getParticipantsStatus,
  releaseSettlement,
  getPaymentIntent,
  cancelSplitService
} from "../services/splits.service";
import { getPaymentsBySplit } from "../services/payment.service";

const SettlementAssetSchema = z.discriminatedUnion("type", [
  z.object({
    network: z.literal("stellar"),
    type: z.literal("native"),
    code: z.literal("XLM"),
  }),
  z.object({
    network: z.literal("stellar"),
    type: z.literal("credit"),
    code: z.string().min(1, "code is required"),
    issuer: z.string().min(1, "issuer is required for credit assets"),
  }),
  z.object({
    network: z.literal("fiat"),
    type: z.literal("bank"),
    code: z.string().min(1, "code is required"),
  }),
]);

const CreateSplitSchema = z.object({
  totalAmount: z.number({ message: "totalAmount must be a number" }).positive("totalAmount must be greater than 0"),
  mode: z.enum(["OPEN_POOL", "FIXED"] as const, {
    message: "mode must be OPEN_POOL or FIXED",
  }),
  settlementAsset: SettlementAssetSchema,
  participants: z
    .array(
      z.object({
        id: z.string().min(1),
        share: z.number().optional(),
      })
    )
    .optional(),
  expiresAt: z.string().optional(),
  webhookUrl: z.string().url("webhookUrl must be a valid URL").optional(),
});


// Función de validación común para IDs de split
function validateId(idParam: unknown): string {
  if (!idParam || Array.isArray(idParam) || typeof idParam !== "string") {
    throw new Error("Invalid split id");
  }
  return idParam;
}


// 1. Controlador para crear un nuevo split
// POST /splits
export async function createSplit(req: Request, res: Response) {
  const parsed = CreateSplitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const split = await createSplitService(parsed.data);
    res.status(201).json(split);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}


// 2. Controlador para obtener un split por su ID
// GET /splits/:id
export async function getSplitById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const split = await getSplitByIdService(id);
    res.json(split);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

// 3. Controlador para cancelar un split
// POST /splits/:id/cancel
export async function getSplitSummaryController(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);
    const split = await getSplitByIdService(id);

    const payments = getPaymentsBySplit(id);
    const paid = payments.reduce(
      (sum, p) => sum + p.convertedAmount,
      0
    );
    const remaining = split.totalAmount - paid;
    const percentage = (paid / split.totalAmount) * 100;

    return res.json({
      totalAmount: split.totalAmount,
      paidAmount: paid,
      remainingAmount: remaining,
      percentageCompleted: Number(percentage.toFixed(2)),
      status: split.status,
    });

  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
}

// 4. Controlador para obtener el estado de los participantes de un split
// GET /splits/:id/participants-status
export async function getParticipantsStatusController(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid split id" });
  }

  const status = await getParticipantsStatus(id);
  res.json(status);
}


// 5.Controlador para liberar el settlement de un split
// POST /splits/:id/release
export async function releaseSettlementController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const split = await releaseSettlement(id);

    res.json(split);
  } catch (error: any) {
      console.error("🔥 STELLAR RELEASE ERROR:");
    console.error(error.response?.data || error);
    throw error;
    //res.status(400).json({ error: error.message });
  }
}

// 6.Controlador para obtener el payment intent de un split
// GET /splits/:id/intent
export async function getPaymentIntentController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const intent = await getPaymentIntent(id);

    res.json(intent);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// 7. Controlador para cancelar un split
// POST /splits/:id/cancel
export async function cancelSplitController(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const split = await cancelSplitService(id);

    res.json({
      message: "Split cancelled",
      split,
    });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}