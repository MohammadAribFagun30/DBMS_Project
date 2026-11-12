import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { departmentController } from "./department.controller";
import { createDepartmentSchema, updateDepartmentSchema } from "./department.validations";

const router = Router();

router.get("/", departmentController.getAll);
router.get("/:id", departmentController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createDepartmentSchema), departmentController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateDepartmentSchema), departmentController.update);
router.delete("/:id", auth(Role.ADMIN), departmentController.remove);

export const departmentRoutes = router;
