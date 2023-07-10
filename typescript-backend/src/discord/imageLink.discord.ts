import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function getDiscordLink({
  hash,
  type,
  guildId,
  size,
}: {
  type: "icon";
  guildId: string;
  hash: string;
  size: number;
}) {
  const url = new URL(
    `https://cdn.discordapp.com/icons/${guildId}/${hash}.png`
  );

  const isPowerOf2 = z
    .number()
    .positive(`Expected size to be a value above 2`)
    .int(`Expected size to be a power of 2`)
    .safeParse(Math.log2(size));

  if (!isPowerOf2.success) {
    throw new Error(fromZodError(isPowerOf2.error).message);
  }
  url.searchParams.set("size", `${size}`);

  return url.toString();
}
