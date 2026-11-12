import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { feedbackController } from "./feedback.controller";
import { createFeedbackSchema } from "./feedback.validations";

const router = Router();

router.post("/", auth(Role.STUDENT), validateRequest(createFeedbackSchema), feedbackController.create);
router.get("/event/:eventId", feedbackController.getByEvent);
router.get("/", auth(Role.ADMIN), feedbackController.getAll);
router.delete("/:id", auth(Role.ADMIN), feedbackController.remove);

export const feedbackRoutes = router;
