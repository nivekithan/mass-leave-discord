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

  csrfSession.set("csrf_token", randomCSRFToken());

  if (state !== csrfToken) {
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    });
  }

  const authInfo = await authorizeUserWithDiscordCode(code);

  return json(
    { code },
    {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    }
  );
}

export default function DiscordOauthCallbackPage() {
  return <h1>Got code</h1>;
}
