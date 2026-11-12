import httpStatus from "http-status";
import { AppError } from "./appError";

// Converts a route param like "12" to a number, or throws 400.
export const parseId = (value: unknown, name = "id"): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${name}`, httpStatus.BAD_REQUEST);
  }
  return id;
};
