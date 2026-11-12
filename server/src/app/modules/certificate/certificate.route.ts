import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { certificateController } from "./certificate.controller";
import { issueCertificateSchema } from "./certificate.validations";

const router = Router();

router.post("/", auth(Role.ADMIN), validateRequest(issueCertificateSchema), certificateController.issue);
router.post("/event/:eventId", auth(Role.ADMIN), certificateController.issueForEvent);
router.get("/my", auth(), certificateController.getMy);
router.get("/", auth(Role.ADMIN), certificateController.getAll);
router.get("/:id", auth(), certificateController.getById);

export const certificateRoutes = router;
