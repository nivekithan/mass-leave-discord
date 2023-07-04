import { createCookie, createCookieSessionStorage } from "@remix-run/node";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const csrfTokenCookie = createCookie("csrf_token", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
});

const csrfSessionStorage = createCookieSessionStorage<{ csrf_token: string }>({
  cookie: csrfTokenCookie,
});

const { getSession } = csrfSessionStorage;

export const {
  commitSession: commitCSRFTokenSession,
  destroySession: destroyCSRFTokenSession,
} = csrfSessionStorage;

export async function getCSRFTokenSession(
  cookieHeader: string | null | undefined
) {
  const csrfSession = await getSession(cookieHeader);

  if (csrfSession.has("csrf_token")) {
    const csrfSessionData = z
      .string()
      .nonempty()
      .safeParse(csrfSession.get("csrf_token"));

    if (csrfSessionData.success) {
      return csrfSession;
    }
  }

  csrfSession.set("csrf_token", randomUUID());
  return csrfSession;
}

export function randomCSRFToken() {
  return randomUUID();
}
