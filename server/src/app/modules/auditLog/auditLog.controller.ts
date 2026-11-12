import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { auditLogServices } from "./auditLog.services";

const getAll = catchAsync(async (req, res) => {
  const result = await auditLogServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Audit logs retrieved", data: result });
});

export const auditLogController = { getAll };
