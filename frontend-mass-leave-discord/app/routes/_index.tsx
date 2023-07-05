import {
  json,
  Response,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { getDiscordOauthUrl } from "~/lib/api/user.server";
import {
  commitCSRFTokenSession,
  getCSRFTokenSession,
} from "~/lib/cookies/csrfTokenCookie.server";
import { getCurrentUser } from "~/lib/cookies/userIdCookie.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Mass Leave Discord Severs" },
    { name: "description", content: "Easily leave multiple discord servers" },
  ];
};

export async function loader({ request }: LoaderArgs) {
  const [csrfSession, currentUser] = await Promise.all([
    getCSRFTokenSession(request.headers.get("Cookie")),
    getCurrentUser(request),
  ]);

  const csrfToken = csrfSession.get("csrf_token")!;

  if (!currentUser.present) {
    const discordOAuthUrl = await getDiscordOauthUrl(csrfToken);

    if (!discordOAuthUrl.ok) {
      throw new Response(null, {
        status: 500,
        statusText: "Internal Server Error",
      });
    }

    return json(
      {
        discordOAuthUrl: discordOAuthUrl.oauth_url,
        userLoggedIn: false,
      } as const,
      {
        headers: {
          "Set-Cookie": await commitCSRFTokenSession(csrfSession),
        },
      }
    );
  }

  const userId = currentUser.userId;

  return json({ userId, userLoggedIn: true } as const, {
    headers: { "Set-Cookie": await commitCSRFTokenSession(csrfSession) },
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="container py-32 flex justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-semibold leading-none tracking-tight text-center">
          Mass leave Discord Servers
        </h1>
        <p className="mt-8 max-w-xl text-center text-lg leading-none ">
          Is your discord dashboard full of servers you don't care ? Use this
          tool to easily leave from them immediately
        </p>
        {loaderData.userLoggedIn ? (
          <Button variant="default" className="mt-8">
            Hey you are logged In. So logout
          </Button>
        ) : (
          <Button variant="default" asChild className="mt-8">
            <Link to={loaderData.discordOAuthUrl}>Connect Discord</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
