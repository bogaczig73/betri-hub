"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE, AUTH_MAX_AGE, expectedToken } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const passcode = String(formData.get("passcode") ?? "").trim();
  const fromRaw = String(formData.get("from") ?? "/");
  const expected = process.env.APP_PASSCODE ?? "";

  if (!expected) {
    return { error: "Server is missing APP_PASSCODE — set it in the env." };
  }
  if (passcode !== expected) {
    return { error: "That passcode didn’t work. Try again." };
  }

  const token = await expectedToken();
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });

  // Only allow same-site relative redirects.
  redirect(fromRaw.startsWith("/") && !fromRaw.startsWith("//") ? fromRaw : "/");
}

export async function logout() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}
