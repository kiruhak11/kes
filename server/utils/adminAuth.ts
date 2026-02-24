import {
  createError,
  getCookie,
  setCookie,
  deleteCookie,
  type H3Event,
} from "h3";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE_NAME = "kes_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getAdminPassword = () => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw createError({
      statusCode: 500,
      statusMessage: "ADMIN_PASSWORD is not configured on server",
    });
  }
  return password;
};

const getSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: "ADMIN_SESSION_SECRET is not configured on server",
    });
  }
  return secret;
};

const signPayload = (payload: string) =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("hex");

const createSessionValue = () => {
  const createdAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${createdAt}.${nonce}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
};

const validateSessionValue = (value: string | undefined | null) => {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [createdAtRaw, nonce, signature] = parts;
  if (!createdAtRaw || !nonce || !signature) return false;

  const createdAt = Number(createdAtRaw);
  if (!Number.isFinite(createdAt)) return false;
  if (Date.now() - createdAt > SESSION_TTL_MS) return false;

  const expected = signPayload(`${createdAtRaw}.${nonce}`);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(signatureBuf, expectedBuf);
};

export const verifyAdminPassword = (password: string) => {
  const expectedPassword = getAdminPassword();
  const providedBuf = Buffer.from(password ?? "");
  const expectedBuf = Buffer.from(expectedPassword);

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(providedBuf, expectedBuf);
};

export const setAdminSession = (event: H3Event) => {
  setCookie(event, ADMIN_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
};

export const clearAdminSession = (event: H3Event) => {
  deleteCookie(event, ADMIN_COOKIE_NAME, { path: "/" });
};

export const isAdminAuthorized = (event: H3Event) => {
  const session = getCookie(event, ADMIN_COOKIE_NAME);
  return validateSessionValue(session);
};

export const requireAdmin = (event: H3Event) => {
  if (!isAdminAuthorized(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Admin authorization required",
    });
  }
};

