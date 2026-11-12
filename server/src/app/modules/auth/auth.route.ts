import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validations";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth(), authController.getMe);

export const authRoutes = router;
