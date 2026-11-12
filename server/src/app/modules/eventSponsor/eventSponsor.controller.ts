import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { eventSponsorServices } from "./eventSponsor.services";

const getAll = catchAsync(async (req, res) => {
  const result = await eventSponsorServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsorship ledger retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await eventSponsorServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsorship entry retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await eventSponsorServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Sponsorship entry created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await eventSponsorServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsorship entry updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await eventSponsorServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Sponsorship entry deleted" });
});

export const eventSponsorController = { getAll, getById, create, update, remove };
