import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { rankingController } from "./ranking.controller";
import { generateRankingSchema } from "./ranking.validations";

const router = Router();

router.post("/generate", auth(Role.ADMIN), validateRequest(generateRankingSchema), rankingController.generate);
router.get("/", rankingController.getByYear);
router.get("/club/:clubId", rankingController.getClubHistory);

export const rankingRoutes = router;
