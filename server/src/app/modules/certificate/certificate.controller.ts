import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { certificateServices } from "./certificate.services";

const issue = catchAsync(async (req, res) => {
  const result = await certificateServices.issue(req.user!.id, req.body.registrationId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Certificate issued", data: result });
});

const issueForEvent = catchAsync(async (req, res) => {
  const result = await certificateServices.issueForEvent(req.user!.id, parseId(req.params.eventId, "eventId"));
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Certificates issued", data: result });
});

const getMy = catchAsync(async (req, res) => {
  const result = await certificateServices.getMy(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My certificates retrieved", data: result });
});

const getAll = catchAsync(async (_req, res) => {
  const result = await certificateServices.getAll();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Certificates retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await certificateServices.getById(req.user!, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Certificate retrieved", data: result });
});

const verify = catchAsync(async (req, res) => {
  const result = await certificateServices.verify(req.params.certificateNumber);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Certificate verified", data: result });
});

export const certificateController = { issue, issueForEvent, getMy, getAll, getById, verify };
