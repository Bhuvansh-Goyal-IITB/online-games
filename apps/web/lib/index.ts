"use server";

import { db } from "@/db";
import { InsertUser, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const signUpUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  const hashedPassword = bcrypt.hashSync(password, 10);

  await db.insert(usersTable).values({
    email,
    password: hashedPassword,
    displayName,
  });
};

export const updateUserDisplayName = async (
  id: string,
  displayName: string
) => {
  const result = await db
    .update(usersTable)
    .set({ displayName })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.displayName,
      image: usersTable.profileImageURL,
    });

  return result;
};

export const getUserByEmail = async (email: string) => {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (result.length != 0) {
    return result[0];
  } else {
    return null;
  }
};

export const addUser = async (data: InsertUser) => {
  await db.insert(usersTable).values(data);
};
