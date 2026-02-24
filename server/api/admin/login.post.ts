import { createError, defineEventHandler, readBody } from "h3";
import { setAdminSession, verifyAdminPassword } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event);
  const password = body?.password ?? "";

  if (!verifyAdminPassword(password)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid admin credentials",
    });
  }

  setAdminSession(event);
  return { success: true };
});

