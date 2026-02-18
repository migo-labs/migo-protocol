
import { Router } from "express";
import {
  createSplit,
  getSplitById,
  getParticipantsStatusController,
  releaseSettlementController,
  getPaymentIntentController,
  cancelSplitController
} from "../controllers/splits.controller";
import { registerPayment } from "../controllers/payments.controller";
import { generateSplitQR } from "../controllers/qr.controller";
import { getPaymentsController } from "../controllers/payments.controller";
import { getSplitSummaryController } from "../controllers/splits.controller";

const router = Router();

router.post("/", createSplit);
router.get("/:id", getSplitById);
router.post("/:id/pay", registerPayment);
router.get("/:id/payments", getPaymentsController);
router.get("/:id/qr", generateSplitQR);
router.get("/:id/participants-status", getParticipantsStatusController);
router.post("/:id/release", releaseSettlementController);
router.get("/:id/intent", getPaymentIntentController);
router.post("/:id/cancel", cancelSplitController);
router.get("/:id/summary", getSplitSummaryController);


export default router;