import { unlink } from "fs/promises";
import { basename, join } from "path";
import { defineEventHandler, getQuery, createError } from "h3";
import { requireAdmin } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);

    const query = getQuery(event);
    const filePathRaw = query.path as string;

    if (!filePathRaw) {
      throw createError({
        statusCode: 400,
        message: "File path is required",
      });
    }

    const fileName = basename(filePathRaw);
    if (!fileName || fileName.includes("..")) {
      throw createError({
        statusCode: 400,
        message: "Invalid file path",
      });
    }

    const filePath = join(process.cwd(), "public", "uploads", fileName);

    await unlink(filePath);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error deleting file",
    });
  }
});
