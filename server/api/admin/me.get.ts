import { defineEventHandler } from "h3";
import { isAdminAuthorized } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  return {
    authorized: isAdminAuthorized(event),
  };
});

