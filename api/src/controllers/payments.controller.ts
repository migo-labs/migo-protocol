import { Request, Response } from "express";
import { z } from "zod";
import { registerPaymentService } from "../services/payment.service";
import { getPaymentsBySplit } from "../services/payment.service";

const RegisterPaymentSchema = z.object({
  payerId: z.string().min(1, "payerId is required"),
  method: z.enum(["STELLAR", "BANK_TRANSFER", "MERCADO_PAGO", "CARD"] as const, {
    message: "method must be STELLAR, BANK_TRANSFER, MERCADO_PAGO or CARD",
  }),
  originalAsset: z.string().min(1, "originalAsset is required"),
  originalAmount: z.number({ message: "originalAmount must be a number" }).positive("originalAmount must be greater than 0"),
});

// Controlador para registrar un pago en un split
export async function registerPayment(req: Request, res: Response) {
  const parsed = RegisterPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const { payerId, method, originalAsset, originalAmount } = parsed.data;

    const result = await registerPaymentService(
      idParam,
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
