import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.services";

const register = catchAsync(async (req, res) => {
  const result = await authServices.register(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Registration successful", data: result });
});

const login = catchAsync(async (req, res) => {
  const result = await authServices.login(req.body.email, req.body.password);
  res.cookie("accessToken", result.accessToken, { httpOnly: true, sameSite: "lax" });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Login successful", data: result });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie("accessToken");
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Logged out" });
});

const getMe = catchAsync(async (req, res) => {
  const result = await authServices.getMe(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Profile retrieved", data: result });
});

export const authController = { register, login, logout, getMe };
