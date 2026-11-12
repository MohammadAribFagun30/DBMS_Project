import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { departmentServices } from "./department.services";

const getAll = catchAsync(async (req, res) => {
  const result = await departmentServices.getAll(req.query as Record<string, string>);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Departments retrieved", data: result });
});

const getById = catchAsync(async (req, res) => {
  const result = await departmentServices.getById(parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Department retrieved", data: result });
});

const create = catchAsync(async (req, res) => {
  const result = await departmentServices.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Department created", data: result });
});

const update = catchAsync(async (req, res) => {
  const result = await departmentServices.update(req.user!.id, parseId(req.params.id), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Department updated", data: result });
});

const remove = catchAsync(async (req, res) => {
  await departmentServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Department deleted" });
});

export const departmentController = { getAll, getById, create, update, remove };
