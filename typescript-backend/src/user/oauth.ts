import { getEnvVar } from "src/utils/env";

const DISCORD_CLIENT_ID = getEnvVar("DISCORD_CLIENT_ID");
const REDIRECT_URI = getEnvVar("DISCORD_REDIRECT_LINK");
const SCOPES = ["guilds", "identify"];

export function generateDiscordOAuthUrl(state: string) {
  const discordAPIUrl = new URL("https://discord.com/api/oauth2/authorize");
  discordAPIUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
  discordAPIUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  discordAPIUrl.searchParams.set("response_type", "code");
  discordAPIUrl.searchParams.set("scope", SCOPES.join(" "));
  discordAPIUrl.searchParams.set("state", state);

  return discordAPIUrl.toString();
}
