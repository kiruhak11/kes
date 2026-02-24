import { defineEventHandler } from "h3";
import { clearAdminSession } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  clearAdminSession(event);
  return { success: true };
});

