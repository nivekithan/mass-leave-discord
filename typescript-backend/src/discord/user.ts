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
  console.log({ url });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-Type": "application/json",
      // "User-Agent": "DiscordBot (http://localhost:3000, 0.0.0)",
    },
  }).then(async (res) => await res.json());

  return DiscordUserSchema.parse(res);
}
