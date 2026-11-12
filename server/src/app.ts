import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { routeHandler } from "./app/middleware/routerHandler";
import router from "./app/routes";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.json({
    message: "Club Event & Workshop Management System API is running",
    docs: "See API_DOCUMENTATION.md",
    baseUrl: "/api",
  });
});

app.use("/api", router);

app.use(routeHandler);
app.use(globalErrorHandler);

export default app;
