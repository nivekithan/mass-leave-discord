import {
  json,
  Response,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GuildList } from "~/components/guildList";
import { Button } from "~/components/ui/button";
import { getDiscordOauthUrl, getUserGuilds } from "~/lib/api/user.server";
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
  const userGuilds = await getUserGuilds(userId);

  if (!userGuilds.ok) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  return json(
    { userId, userLoggedIn: true, userGuilds: userGuilds.guilds } as const,
    {
      headers: { "Set-Cookie": await commitCSRFTokenSession(csrfSession) },
    }
  );
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="container py-32">
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-4xl font-semibold leading-none tracking-tight text-center">
          Mass leave Discord Servers
        </h1>
        <p className="max-w-xl text-center text-lg leading-none ">
          Is your discord dashboard full of servers you don't care ? Use this
          tool to easily leave from them immediately
        </p>
        {loaderData.userLoggedIn ? (
          <div>
            <GuildList
              guilds={loaderData.userGuilds.map((v) => {
                return {
                  iconUrl: v.icon_url || "",
                  id: v.id,
                  name: v.name,
                };
              })}
            />
          </div>
        ) : (
          <Button variant="default" asChild className="mt-8">
            <Link to={loaderData.discordOAuthUrl}>Connect Discord</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
