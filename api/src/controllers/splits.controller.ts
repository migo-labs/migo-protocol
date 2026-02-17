import { Request, Response } from "express";
import {
  createSplitService,
  getSplitByIdService,
} from "../services/splits.service";
import { getParticipantsStatus } from "../services/splits.service";
import { releaseSettlement } from "../services/splits.service";
import { getPaymentIntent } from "../services/splits.service";

// Controlador para crear un nuevo split
export async function createSplit(req: Request, res: Response) {
  try {
    const split = await createSplitService(req.body);
    res.status(201).json(split);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
  //console.log("REQ BODY:", req.body);
}


// Controlador para obtener un split por su ID
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

// Controlador para obtener el estado de los participantes de un split
export async function getParticipantsStatusController(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid split id" });
  }

  const status = await getParticipantsStatus(id);
  res.json(status);
}

// Controlador para liberar el settlement de un split
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

// Controlador para obtener el payment intent de un split
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
