import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { venueServices } from "./venue.services";

const getAll = catchAsync(async (req, res) => {
  const result = await venueServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Venues retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await venueServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Venue retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await venueServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Venue created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await venueServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Venue updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await venueServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Venue deleted" });
});

export const venueController = { getAll, getById, create, update, remove };
