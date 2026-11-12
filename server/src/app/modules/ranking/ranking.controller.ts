import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { rankingServices } from "./ranking.services";

const generate = catchAsync(async (req, res) => {
  const result = await rankingServices.generate(req.user!.id, req.body.year);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Rankings generated for ${req.body.year}`, data: result });
});

const getByYear = catchAsync(async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const result = await rankingServices.getByYear(year);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Rankings for ${year}`, data: result });
});

const getClubHistory = catchAsync(async (req, res) => {
  const result = await rankingServices.getClubHistory(parseId(req.params.clubId, "clubId"));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Club ranking history retrieved", data: result });
});

export const rankingController = { generate, getByYear, getClubHistory };
