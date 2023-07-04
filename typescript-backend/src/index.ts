import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getEnvVar } from "./utils/env";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

serve({ fetch: app.fetch, port: getEnvVar("PORT") }, ({ port }) => {
  console.log(`Running ts backend at port ${port}`);
});
