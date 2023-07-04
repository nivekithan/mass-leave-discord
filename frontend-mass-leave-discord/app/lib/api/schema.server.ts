import { z } from "zod";

export const APIErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  message: z.string(),
});
