import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getEnvVar } from "./utils/env";
import { userRouter } from "./userRouter/user.router";

const api = new Hono();

api.route("/user", userRouter);

const app = new Hono();

app.route("/api/v1", api);

serve({ fetch: app.fetch, port: getEnvVar("PORT") }, ({ port }) => {
  console.log(`Running ts backend at port ${port}`);
});
