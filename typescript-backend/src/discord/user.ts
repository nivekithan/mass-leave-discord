import { z } from "zod";
import { DISCORD_API_BASE_URL } from "./constant";

const DiscordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
});

export type DiscordUser = z.infer<typeof DiscordUserSchema>;

export async function getDiscordUser({ token }: { token: string }) {
  const url = new URL("users/@me", DISCORD_API_BASE_URL);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-Type": "application/json",
      // "User-Agent": "DiscordBot (http://localhost:3000, 0.0.0)",
    },
  }).then((res) => res.json());

  return DiscordUserSchema.parse(res);
}

const DiscordGuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  owner: z.boolean().optional(),
});

export async function getCurrentUserGuilds({ token }: { token: string }) {
  const url = new URL("users/@me/guilds", DISCORD_API_BASE_URL);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());

  const discordGuildList = DiscordGuildSchema.array().parse(res);

  return discordGuildList;
}
