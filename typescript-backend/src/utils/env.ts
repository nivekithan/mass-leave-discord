import { z } from "zod";

/**
 * When we are starting the server. We will verify all environment variables are present
 * and initialzed with the expected type (like url and others)
 */
let isEnvVarVerificationRun = false;

const EnvVarSchema = z.object({
  PORT: z.coerce
    .number()
    .nonnegative("Set valid value for environment variable PORT"),
  DISCORD_CLIENT_ID: z
    .string()
    .nonempty("Set valid value for environment variable DISCORD_CLIENT_ID"),
  DISCORD_CLIENT_SECRET: z
    .string()
    .nonempty("Set valid value for environment variable DISCORD_CLIENT_SECRET"),
  DISCORD_REDIRECT_LINK: z
    .string()
    .url(
      "Set valid url as value for environment variable DISCORD_REDIRECT_LINK"
    ),
});

let envVar: null | z.infer<typeof EnvVarSchema> = null;

function verifyEnvVar() {
  envVar = EnvVarSchema.parse(process.env);
}

if (!isEnvVarVerificationRun) {
  verifyEnvVar();
  isEnvVarVerificationRun = true;
}

type EnvVarNames = keyof z.infer<typeof EnvVarSchema>;

export function getEnvVar<Name extends EnvVarNames>(
  name: Name
): z.infer<typeof EnvVarSchema>[Name] {
  if (envVar === null) {
    throw new Error(
      "You can have called getEnvVar function before environment variables have been initalized"
    );
  }
  return envVar[name];
}
