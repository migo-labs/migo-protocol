import { Request, Response } from "express";
import {
  createSplitService,
  getSplitByIdService,
  getParticipantsStatus,
  releaseSettlement,
  getPaymentIntent,
  cancelSplitService
} from "../services/splits.service";
import { getPaymentsBySplit } from "../services/payment.service";


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
  try {
    const split = await createSplitService(req.body);
    res.status(201).json(split);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
  //console.log("REQ BODY:", req.body);
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
    res.status(400).json({ error: error.message });
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