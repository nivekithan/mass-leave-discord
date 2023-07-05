import { Hono } from "hono";
import { generateDiscordOAuthUrl } from "./oauth";
import { BAD_REQUEST } from "src/utils/statusCode";
import { z } from "zod";
import { getEnvVar } from "src/utils/env";
import { getDiscordUser } from "src/discord/user";
import { upsertUserToDb } from "src/modals/user";
import { fromZodError } from "zod-validation-error";
import { exchangeOAuthCode } from "src/discord/oauth2";

export const userRouter = new Hono();

userRouter.get("/discord/oauth_url", async (c) => {
  const stateQuery = z.string().safeParse(c.req.query("state"));

  if (!stateQuery.success) {
    const message = fromZodError(stateQuery.error).message;

    return c.json(
      {
        ok: false,
        error: "bad_request",
        message: message,
      },
      BAD_REQUEST
    );
  }
  const state = stateQuery.data;

  return c.json({ ok: true, oauth_url: generateDiscordOAuthUrl(state) });
});

userRouter.post("/discord/authorize", async (c) => {
  const parsedBody = z
    .object({ code: z.string() })
    .safeParse(await c.req.json());

  if (!parsedBody.success) {
    return c.json(
      {
        ok: false,
        error: "bad_request",
        message: fromZodError(parsedBody.error),
      },
      BAD_REQUEST
    );
  }

  const code = parsedBody.data.code;

  const authorizationFromDiscord = await exchangeOAuthCode({
    clientId: getEnvVar("DISCORD_CLIENT_ID"),
    clientSecret: getEnvVar("DISCORD_CLIENT_SECRET"),
    code,
    redirectUri: getEnvVar("DISCORD_REDIRECT_LINK"),
  });

  const discordUser = await getDiscordUser({
    token: authorizationFromDiscord.access_token,
  });

  const userId = upsertUserToDb({
    id: discordUser.id,
    access_key: authorizationFromDiscord.access_token,
    discriminator: discordUser.discriminator,
    expires_in: authorizationFromDiscord.expires_in,
    refresh_key: authorizationFromDiscord.refresh_token,
    token_type: authorizationFromDiscord.token_type,
    username: discordUser.username,
  });

  return c.json({ ok: true, userId: userId.id });
});
