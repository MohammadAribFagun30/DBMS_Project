import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { eventServices } from "./event.services";

const getAll = catchAsync(async (req, res) => {
  const result = await eventServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Events retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await eventServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Event retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await eventServices.create(req.user!, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Event created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await eventServices.update(req.user!, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Event updated", data: result });
});

const updateStatus = catchAsync(async (req, res) => {
  const result = await eventServices.updateStatus(req.user!.id, parseId(req.params.id), req.body.status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Event marked as ${result.status}`, data: result });
});

const remove = catchAsync(async (req, res) => {
  await eventServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Event deleted" });
});

const getRegistrations = catchAsync(async (req, res) => {
  const result = await eventServices.getRegistrations(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Event registrations retrieved", data: result });
});

export const eventController = { getAll, getById, create, update, updateStatus, remove, getRegistrations };
