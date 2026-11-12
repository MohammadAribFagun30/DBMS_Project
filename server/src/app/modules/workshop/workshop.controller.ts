import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { workshopServices } from "./workshop.services";

const getAll = catchAsync(async (req, res) => {
  const result = await workshopServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Workshops retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await workshopServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Workshop retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await workshopServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Workshop created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await workshopServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Workshop updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await workshopServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Workshop deleted" });
});

export const workshopController = { getAll, getById, create, update, remove };
