
import { Router } from "express";
import { generateSplitQR } from "../controllers/qr.controller";


const router = Router();

router.get("/:id", generateSplitQR);

export default router;