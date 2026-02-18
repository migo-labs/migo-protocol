import { Request, Response } from "express";
import { registerPaymentService } from "../services/payment.service";
import { getPaymentsBySplit } from "../services/payment.service";


// Controlador para registrar un pago en un split
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

// Controlador para obtener un split por su id
export async function getPaymentsController(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid split id" });
  }

  const payments = getPaymentsBySplit(id);
  res.json(payments);
}
