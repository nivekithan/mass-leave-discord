import {
  json,
  Response,
  type LoaderArgs,
  type V2_MetaFunction,
  type ActionArgs,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { GuildList } from "~/components/guildList";
import { Button } from "~/components/ui/button";
import {
  getDiscordOauthUrl,
  getUserGuilds,
  removeUserFromGuilds,
} from "~/lib/api/user.server";
import {
  commitCSRFTokenSession,
  getCSRFTokenSession,
} from "~/lib/cookies/csrfTokenCookie.server";
import { getCurrentUser, requireUser } from "~/lib/cookies/userIdCookie.server";
import { fromZodError } from "zod-validation-error";

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

function safeJSONParse(jsonString: string) {
  try {
    const value = JSON.parse(jsonString) as unknown;

    return { ok: true, value } as const;
  } catch (err: unknown) {
    return { ok: false, err } as const;
  }
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const userId = user.userId;

  const formData = await request.formData();

  const action = formData.get("action");

  if (!action || action !== "remove_servers") {
    return json({ status: "error", error: "unknown_action" } as const, {
      status: 400,
    });
  }

  const ids = formData.get("idList");

  if (!ids || typeof ids !== "string") {
    return json({ status: "error", error: "invalid_idList" } as const, {
      status: 400,
    });
  }

  const idList = safeJSONParse(ids);

  if (!idList.ok) {
    return json({ status: "error", error: "invalid_idList" } as const, {
      status: 400,
    });
  }

  const jsonValue = z.array(z.string()).safeParse(idList.value);

  if (!jsonValue.success) {
    return json(
      {
        status: "error",
        error: fromZodError(jsonValue.error).message,
      } as const,
      { status: 400 }
    );
  }

  const guildIdsToLeave = jsonValue.data;

  await removeUserFromGuilds(userId, guildIdsToLeave);

  return json({ guildIdsToLeave, status: "ok" } as const);
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
