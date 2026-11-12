import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { clubController } from "./club.controller";
import { createClubSchema, updateClubSchema } from "./club.validations";

const router = Router();

router.get("/", clubController.getAll);
router.get("/:id", clubController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createClubSchema), clubController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateClubSchema), clubController.update);
router.delete("/:id", auth(Role.ADMIN), clubController.remove);

export const clubRoutes = router;
