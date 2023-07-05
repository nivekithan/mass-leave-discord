import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import { getEnvVar } from "../env.server";

const userIdCookie = createCookie("user-id", {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
  secure: true,
  secrets: [getEnvVar("COOKIE_SIGNING_SECRET")],
});

const userIdSession = createCookieSessionStorage<{ userId: string }>({
  cookie: userIdCookie,
});

export async function loginInUser(request: Request, userId: string) {
  const cookieHeader = request.headers.get("Cookie");
  const userSession = await userIdSession.getSession(cookieHeader);

  userSession.set("userId", userId);

  const setCookieHeaderValue = await userIdSession.commitSession(userSession);

  return setCookieHeaderValue;
}

export async function logoutUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const userSession = await userIdSession.getSession(cookieHeader);

  const setCookieHeaderValue = await userIdSession.destroySession(userSession);

  return setCookieHeaderValue;
}

export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const userSession = await userIdSession.getSession(cookieHeader);

  const userId = userSession.get("userId");

  if (!userId) {
    return { present: false, userSession } as const;
  }

  const isValid = /**TODO: Check whether userId is valid or not */ true;

  if (!isValid) {
    throw redirect("/", {
      headers: {
        "Set-Cookie": await userIdSession.destroySession(userSession),
      },
    });
  }

  return { present: true, userId, userSession };
}

export async function requireUser(request: Request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser.present) {
    throw redirect("/");
  }

  return { userId: currentUser.userId, userSession: currentUser.userSession };
}
/**
 * Functionalties these api should provide
 *
 * 1. Logining in user
 * 2. Loging out user
 * 3. Get current user
 * 4. If user is not authenticated redirect to login page
 * 5. If userId is not valid logout user
 *
 */
