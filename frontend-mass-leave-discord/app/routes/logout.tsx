import { redirect, type ActionArgs } from "@remix-run/node";
import { logoutUser } from "~/lib/cookies/userIdCookie.server";

export async function action({ request }: ActionArgs) {
  const logoutUserSetCookieValue = await logoutUser(request);

  return redirect("/", { headers: { "Set-Cookie": logoutUserSetCookieValue } });
}

//TODO: Create a logout page
