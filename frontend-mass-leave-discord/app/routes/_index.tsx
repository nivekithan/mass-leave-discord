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
} from "~/lib/cookies.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Mass Leave Discord Severs" },
    { name: "description", content: "Easily leave multiple discord servers" },
  ];
};

export async function loader({ request }: LoaderArgs) {
  const csrfSession = await getCSRFTokenSession(request.headers.get("Cookie"));

  const csrfToken = csrfSession.get("csrf_token")!;

  const discordOAuthUrl = await getDiscordOauthUrl(csrfToken);

  if (!discordOAuthUrl.ok) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  return json(
    { discordOAuthUrl: discordOAuthUrl.oauth_url },
    {
      headers: {
        "Set-Cookie": await commitCSRFTokenSession(csrfSession),
      },
    }
  );
}

export default function Index() {
  const { discordOAuthUrl } = useLoaderData<typeof loader>();

  console.log(decodeURIComponent(discordOAuthUrl));

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
        <Button variant="default" asChild className="mt-8">
          <Link to={discordOAuthUrl}>Connect Discord</Link>
        </Button>
      </div>
    </main>
  );
}
