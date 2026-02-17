import { Request, Response } from "express";
import { getSplitByIdService } from "../services/splits.service";
import { buildSplitQRPayload } from "../services/qr.service";
import { buildMockTransactionXdr, generateSep7Uri } from "../services/sep7.service";

export async function generateSplitQR(req: Request, res: Response) {
  try {
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({ error: "Invalid split id" });
    }

    const split = await getSplitByIdService(idParam);
// MOCK: generar un XDR de transacción con los detalles del split
    const xdr = buildMockTransactionXdr(split.id, split.totalAmount);
    const sep7Uri = generateSep7Uri(xdr); 

    const payload = buildSplitQRPayload(split);
// Enviar la respuesta con el URI SEP-7 y el payload para fallback
    res.json({
      type: "MIGO_PAYMENT_SESSION",
      intentUrl: `http://localhost:3000/splits/${split.id}/intent`
    });

  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}