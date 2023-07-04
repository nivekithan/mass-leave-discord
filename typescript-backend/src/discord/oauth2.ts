import { z } from "zod";

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

export async function exchangeOAuthCode({
  clientId,
  clientSecret,
  code,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const searchParams = new URLSearchParams();

  searchParams.set("code", code);
  searchParams.set("client_id", clientId);
  searchParams.set("client_secret", clientSecret);
  searchParams.set("grant_type", "authorization_code");
  searchParams.set("redirect_uri", redirectUri);

  const res = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    body: searchParams,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const parseRes = await res.json();

  return z
    .object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
      refresh_token: z.string(),
    })
    .parse(parseRes);
}
