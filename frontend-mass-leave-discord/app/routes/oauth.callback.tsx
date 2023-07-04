import { redirect, type LoaderArgs, json } from "@remix-run/node";
import { z } from "zod";
import { authorizeUserWithDiscordCode } from "~/lib/api/user.server";
import {
  commitCSRFTokenSession,
  getCSRFTokenSession,
  randomCSRFToken,
} from "~/lib/cookies.server";

export async function loader({ request }: LoaderArgs) {
  const csrfSession = await getCSRFTokenSession(request.headers.get("Cookie"));

  const url = new URL(request.url);

  const code = z.string().nonempty().parse(url.searchParams.get("code"));
  const state = z.string().nonempty().parse(url.searchParams.get("state"));

  const csrfToken = csrfSession.get("csrf_token");

  /**
   * csrf_token is generated when a user opens our website and is cleared when
   * user closes our website.
   *
   * The reason for why we are resetting the csrf_token here is because, once the
   * authorization process has finished (successfully or not), we should reset the
   * state parameter because... security ?
   *
   * TODO: Find is it necessary to regenerate the state paramerter or not from
   * oauth spec
   *
   */
  csrfSession.set("csrf_token", randomCSRFToken());

  if (state !== csrfToken) {
    /**
     * Since state query from the url does not match the csrf_token from the session
     * we can safely assume that we didn't initate this discord connection request and
     * therefore ignore it.
     */
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    });
  }

  const authInfo = await authorizeUserWithDiscordCode(code);

  if (!authInfo.ok) {
    /**
     * TODO:
     * Some reason authorization has failed therefore show user proper error
     * message
     */
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    });
  }

  const userId = authInfo.userId;

  /**
   * TODO:
   * Set userId in session storage and pass it in cookie
   */
  return json(
    { userId },
    {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    }
  );
}
