import { Request, Response } from "express";
import { registerPaymentService } from "../services/payment.service";

export async function registerPayment(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({ error: 'id debe ser una cadena' });
    }
    const id = idParam;

    const { payerId, method, originalAsset, originalAmount } = req.body;

    const result = await registerPaymentService(
      id,
      payerId,
      method,
      originalAsset,
      originalAmount
    );

    
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

