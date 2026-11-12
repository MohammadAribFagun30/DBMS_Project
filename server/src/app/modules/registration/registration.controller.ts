import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { registrationServices } from "./registration.services";

const register = catchAsync(async (req, res) => {
  const result = await registrationServices.register(req.user!.id, req.body.eventId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Registration confirmed", data: result });
});

const getMy = catchAsync(async (req, res) => {
  const result = await registrationServices.getMy(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My registrations retrieved", data: result });
});

const getAll = catchAsync(async (req, res) => {
  const result = await registrationServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Registrations retrieved", data: result });
});

const cancel = catchAsync(async (req, res) => {
  const result = await registrationServices.cancel(req.user!, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Registration cancelled", data: result });
});

const markAttended = catchAsync(async (req, res) => {
  const result = await registrationServices.markAttended(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Marked as attended", data: result });
});

export const registrationController = { register, getMy, getAll, cancel, markAttended };
