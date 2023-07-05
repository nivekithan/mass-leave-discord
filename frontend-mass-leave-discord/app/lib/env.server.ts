import { z } from "zod";

/**
 * When we are starting the server. We will verify all environment variables are present
 * and initialzed with the expected type (like url and others)
 */
let isEnvVarVerificationRun = false;

const EnvVarSchema = z.object({
  BACKEND_URL: z
    .string()
    .url(`Set valid url for environment variable BACKEND_URL`),
  COOKIE_SIGNING_SECRET: z
    .string({
      required_error: `Required environment variable COOKIE_SIGNING_SECRET is not set`,
    })
    .uuid({
      message: `Environment variable COOKIE_SIGNING_SECRET should be uuid`,
    }),
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

export function getEnvVar(name: EnvVarNames) {
  if (envVar === null) {
    throw new Error(
      "You can have called getEnvVar function before environment variables have been initalized"
    );
  }
  return envVar[name];
}
