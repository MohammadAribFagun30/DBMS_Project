import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { registrationController } from "./registration.controller";
import { createRegistrationSchema } from "./registration.validations";

const router = Router();

router.post("/", auth(Role.STUDENT), validateRequest(createRegistrationSchema), registrationController.register);
router.get("/my", auth(), registrationController.getMy);
router.get("/", auth(Role.ADMIN), registrationController.getAll);
router.patch("/:id/cancel", auth(), registrationController.cancel);
router.patch("/:id/attend", auth(Role.ADMIN), registrationController.markAttended);

export const registrationRoutes = router;
