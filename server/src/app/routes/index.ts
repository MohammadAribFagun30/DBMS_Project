import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { departmentRoutes } from "../modules/department/department.route";
import { clubRoutes } from "../modules/club/club.route";
import { venueRoutes } from "../modules/venue/venue.route";
import { eventRoutes } from "../modules/event/event.route";
import { workshopRoutes } from "../modules/workshop/workshop.route";
import { registrationRoutes } from "../modules/registration/registration.route";
import { certificateRoutes } from "../modules/certificate/certificate.route";
import { sponsorRoutes } from "../modules/sponsor/sponsor.route";
import { eventSponsorRoutes } from "../modules/eventSponsor/eventSponsor.route";
import { feedbackRoutes } from "../modules/feedback/feedback.route";
import { rankingRoutes } from "../modules/ranking/ranking.route";
import { auditLogRoutes } from "../modules/auditLog/auditLog.route";
import { notificationRoutes } from "../modules/notification/notification.route";
import { dashboardRoutes } from "../modules/dashboard/dashboard.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/departments", route: departmentRoutes },
  { path: "/clubs", route: clubRoutes },
  { path: "/venues", route: venueRoutes },
  { path: "/events", route: eventRoutes },
  { path: "/workshops", route: workshopRoutes },
  { path: "/registrations", route: registrationRoutes },
  { path: "/certificates", route: certificateRoutes },
  { path: "/sponsors", route: sponsorRoutes },
  { path: "/event-sponsors", route: eventSponsorRoutes },
  { path: "/feedbacks", route: feedbackRoutes },
  { path: "/rankings", route: rankingRoutes },
  { path: "/audit-logs", route: auditLogRoutes },
  { path: "/notifications", route: notificationRoutes },
  { path: "/dashboard", route: dashboardRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
