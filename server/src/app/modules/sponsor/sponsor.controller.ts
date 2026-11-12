import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { sponsorServices } from "./sponsor.services";

const getAll = catchAsync(async (req, res) => {
  const result = await sponsorServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsors retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await sponsorServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsor retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await sponsorServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Sponsor created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await sponsorServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsor updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await sponsorServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsor deleted" });
});

export const sponsorController = { getAll, getById, create, update, remove };
