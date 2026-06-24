"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  const passwordHash = process.env.APP_PASSWORD_HASH;

  if (!passwordHash) {
    return { error: "Server configuration error" };
  }

  const isValid = await bcrypt.compare(password, passwordHash);

  if (!isValid) {
    return { error: "Invalid password" };
  }

  await createSession("user");
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
