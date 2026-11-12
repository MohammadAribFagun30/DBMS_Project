import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import { updateProfileSchema, updateRoleSchema } from "./user.validations";

const router = Router();

router.patch("/me", auth(), validateRequest(updateProfileSchema), userController.updateProfile);

router.get("/", auth(Role.ADMIN), userController.getAll);
router.get("/:id", auth(Role.ADMIN), userController.getById);
router.patch("/:id/role", auth(Role.ADMIN), validateRequest(updateRoleSchema), userController.updateRole);
router.delete("/:id", auth(Role.ADMIN), userController.remove);

export const userRoutes = router;
