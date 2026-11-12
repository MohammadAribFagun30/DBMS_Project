import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { sponsorController } from "./sponsor.controller";
import { createSponsorSchema, updateSponsorSchema } from "./sponsor.validations";

const router = Router();

router.get("/", auth(Role.ADMIN), sponsorController.getAll);
router.get("/:id", auth(Role.ADMIN), sponsorController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createSponsorSchema), sponsorController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateSponsorSchema), sponsorController.update);
router.delete("/:id", auth(Role.ADMIN), sponsorController.remove);

export const sponsorRoutes = router;
