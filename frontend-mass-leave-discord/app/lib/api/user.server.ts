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

export async function authorizeUserWithDiscordCode(code: string) {
  const url = new URL(
    "/api/v1/user/discord/authorize",
    getEnvVar("BACKEND_URL")
  );

  const res = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  const body = z
    .union([
      APIErrorSchema,
      z.object({ ok: z.literal(true), userId: z.string() }),
    ])
    .parse(await res.json());

  return body;
}

export async function getUserGuilds(userId: string) {
  const url = new URL(
    `/api/v1/user/${userId}/active_guilds`,
    getEnvVar("BACKEND_URL")
  );

  const res = await fetch(url);

  const body = z
    .union([
      APIErrorSchema,
      z.object({
        ok: z.literal(true),
        guilds: z
          .object({
            id: z.string(),
            name: z.string(),
            icon_url: z.string().url().optional(),
            owner: z.boolean(),
          })
          .array(),
      }),
    ])
    .parse(await res.json());

  return body;
}

export async function removeUserFromGuilds(
  userId: string,
  guildIdList: Array<string>
) {
  const url = new URL(
    `/api/v1/user/${userId}/leave_guilds`,
    getEnvVar("BACKEND_URL")
  );

  const res = await fetch(url, {
    method: "DELETE",
    body: JSON.stringify(guildIdList),
  }).then((res) => res.json());

  console.log(res);
}
