import { Hono } from "hono";
import { generateDiscordOAuthUrl } from "./oauth";
import { BAD_REQUEST } from "src/utils/statusCode";
import { z } from "zod";

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

  return c.json({ oauth_url: generateDiscordOAuthUrl(state) });
});
