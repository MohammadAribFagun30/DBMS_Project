import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { dashboardServices } from "./dashboard.services";

const getStats = catchAsync(async (_req, res) => {
  const result = await dashboardServices.getStats();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Dashboard stats retrieved", data: result });
});

export const dashboardController = { getStats };
