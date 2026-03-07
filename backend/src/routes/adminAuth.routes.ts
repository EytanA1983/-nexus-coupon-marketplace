import { Router } from "express";
import { adminLogin, me } from "../controllers/admin/adminAuth.controller";
import { authenticateAdmin } from "../middleware/authenticateAdmin";
import { validateRequest } from "../middleware/validateRequest";
import { adminLoginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", validateRequest({ body: adminLoginSchema }), adminLogin);
router.get("/me", authenticateAdmin, me);

export default router;
