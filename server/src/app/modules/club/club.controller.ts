import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { clubServices } from "./club.services";

const getAll = catchAsync(async (req, res) => {
  const result = await clubServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Clubs retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await clubServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Club retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await clubServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Club created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await clubServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Club updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await clubServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Club deleted" });
});

export const clubController = { getAll, getById, create, update, remove };
