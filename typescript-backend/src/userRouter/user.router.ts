import { Hono } from "hono";
import { generateDiscordOAuthUrl } from "./oauth";
import { BAD_REQUEST } from "src/utils/statusCode";
import { z } from "zod";
import { getEnvVar } from "src/utils/env";
import { getCurrentUserGuilds, getDiscordUser } from "src/discord/user.discord";
import { getUserFromDb, upsertUserToDb } from "src/modals/user.modal";
import { fromZodError } from "zod-validation-error";
import { exchangeOAuthCode } from "src/discord/oauth2.discord";
import { getDiscordLink } from "src/discord/imageLink.discord";

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

userRouter.get("/:userId/active_guilds", async (c) => {
  const userId = c.req.param("userId");

  const userInDb = getUserFromDb(userId);

  if (!userInDb) {
    return c.json(
      {
        ok: false,
        error: "bad_request",
        message: `There is no user with id ${userId}`,
      },
      BAD_REQUEST
    );
  }

  const memberGuilds = await getCurrentUserGuilds({
    token: userInDb.access_key,
  });

  return c.json({
    ok: true,
    guilds: memberGuilds.map((v) => {
      return {
        id: v.id,
        name: v.name,
        icon_url: v.icon
          ? getDiscordLink({
              type: "icon",
              hash: v.icon,
              guildId: v.id,
              size: 64,
            })
          : undefined,
        owner: v.owner ? true : false,
      };
    }),
  });
});
