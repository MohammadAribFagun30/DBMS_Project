import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { feedbackServices } from "./feedback.services";

const create = catchAsync(async (req, res) => {
  const result = await feedbackServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Anonymous feedback submitted", data: result });
});

const getMy = catchAsync(async (req, res) => {
  const result = await feedbackServices.getMy(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User feedback history retrieved", data: result });
});

const getByEvent = catchAsync(async (req, res) => {
  const result = await feedbackServices.getByEvent(parseId(req.params.eventId, "eventId"));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Event feedback retrieved", data: result });
});

const getAll = catchAsync(async (req, res) => {
  const result = await feedbackServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Feedbacks retrieved", data: result });
});

const remove = catchAsync(async (req, res) => {
  await feedbackServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Feedback deleted" });
});

export const feedbackController = { create, getMy, getByEvent, getAll, remove };
