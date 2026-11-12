import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { venueController } from "./venue.controller";
import { createVenueSchema, updateVenueSchema } from "./venue.validations";

const router = Router();

router.get("/", venueController.getAll);
router.get("/:id", venueController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createVenueSchema), venueController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateVenueSchema), venueController.update);
router.delete("/:id", auth(Role.ADMIN), venueController.remove);

export const venueRoutes = router;
