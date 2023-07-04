import { Hono } from "hono";
import { generateDiscordOAuthUrl } from "./oauth";
import { BAD_REQUEST } from "src/utils/statusCode";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { exchangeOAuthCode } from "src/discord/oauth2";
import { getEnvVar } from "src/utils/env";

export const userRouter = new Hono();

userRouter.get("/discord/oauth_url", async (c) => {
  const stateQuery = z.string().safeParse(c.req.query("state"));

  if (!stateQuery.success) {
    return c.json(
      {
        ok: false,
        error: "bad_request",
        message:
          "Invalid value for query variable 'state'. It's type is string",
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

  return c.json({ ok: true, userId: "xxx" });
});
