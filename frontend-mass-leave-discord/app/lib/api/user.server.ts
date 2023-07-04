import { z } from "zod";
import { getEnvVar } from "../env.server";
import { APIErrorSchema } from "./schema.server";

export async function getDiscordOauthUrl(csrfToken: string) {
  const url = new URL(
    "/api/v1/user/discord/oauth_url",
    getEnvVar("BACKEND_URL")
  );

  url.searchParams.set("state", csrfToken);

  const res = await fetch(url.toString());

  const body = z
    .union([
      APIErrorSchema,
      z.object({ ok: z.literal(true), oauth_url: z.string() }),
    ])
    .parse(await res.json());

  return body;
}
