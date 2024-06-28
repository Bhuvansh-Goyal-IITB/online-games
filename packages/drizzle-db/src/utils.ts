import { db } from "./db.js";
import { usersTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

interface IAddUser {
  email: string;
  displayName?: string;
  password?: string;
  profileImageURL?: string;
}

export const getUserByEmail = async (email: string) => {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const user = result[0];

  return user ?? null;
};

export const addUser = async ({
  email,
  displayName,
  password,
  profileImageURL,
}: IAddUser) => {
  await db.insert(usersTable).values({
    email,
    password,
    displayName,
    profileImageURL,
  });
};

export const updateUserDisplayName = async (
  id: string,
  displayName: string
) => {
  return await db
    .update(usersTable)
    .set({ displayName })
    .where(eq(usersTable.id, id));
};

export const getUserById = async (id: string) => {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  const user = result[0];

  return user ?? null;
};
