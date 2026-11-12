import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { userServices } from "./user.services";

const getAll = catchAsync(async (req, res) => {
  const result = await userServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Users retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await userServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User retrieved", data: result });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await userServices.updateProfile(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Profile updated", data: result });
});

const updateRole = catchAsync(async (req, res) => {
  const result = await userServices.updateRole(req.user!.id, parseId(req.params.id), req.body.role);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User role updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await userServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User deleted" });
});

export const userController = { getAll, getById, updateProfile, updateRole, remove };
