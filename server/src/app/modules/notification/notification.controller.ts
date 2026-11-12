import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { parseId } from "../../utils/parseId";
import { notificationServices } from "./notification.services";

const getMy = catchAsync(async (req, res) => {
  const result = await notificationServices.getMy(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notifications retrieved", data: result });
});

const markRead = catchAsync(async (req, res) => {
  const result = await notificationServices.markRead(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notification marked as read", data: result });
});

const markAllRead = catchAsync(async (req, res) => {
  const result = await notificationServices.markAllRead(req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "All notifications marked as read", data: result });
});

const remove = catchAsync(async (req, res) => {
  await notificationServices.remove(req.user!.id, parseId(req.params.id));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notification deleted" });
});

const send = catchAsync(async (req, res) => {
  const result = await notificationServices.send(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Notification sent", data: result });
});

export const notificationController = { getMy, markRead, markAllRead, remove, send };
