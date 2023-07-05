import { InferModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "src/utils/db";

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("discord_username").notNull(),
  discriminator: text("discriminator").notNull(),
  access_key: text("access_key").notNull(),
  refresh_key: text("refresh_key").notNull(),
  token_type: text("token_type").notNull(),
  expires_in: int("expires_in").notNull(),
});

export type UserInDb = InferModel<typeof userTable, "select">;
export type NewUserInDb = InferModel<typeof userTable, "insert">;

export function upsertUserToDb(user: NewUserInDb) {
  return db
    .insert(userTable)
    .values(user)
    .onConflictDoUpdate({
      set: { ...user, id: undefined },
      target: userTable.id,
    })
    .returning()
    .get();
}
