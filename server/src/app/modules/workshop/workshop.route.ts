import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { workshopController } from "./workshop.controller";
import { createWorkshopSchema, updateWorkshopSchema } from "./workshop.validations";

const router = Router();

router.get("/", workshopController.getAll);
router.get("/:id", workshopController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createWorkshopSchema), workshopController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateWorkshopSchema), workshopController.update);
router.delete("/:id", auth(Role.ADMIN), workshopController.remove);

export const workshopRoutes = router;
