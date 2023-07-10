import { DISCORD_API_BASE_URL } from "./constant.discord";

export async function leaveGuild({ id, token }: { id: string; token: string }) {
  console.log({ id, token });
  const url = new URL(`users/@me/guilds/${id}`, DISCORD_API_BASE_URL);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(res);

  try {
    const resInJson = await res.json();

    console.log(resInJson);
  } catch (err) {
    console.log("Error while parsing res in json");
  }
}
