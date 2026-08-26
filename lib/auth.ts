import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function createSession(userId: number) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();

  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    return null;
  }

  const userId = Number(session.value);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      restaurantId: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  return user;
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function getCurrentManager() {
  const user = await getCurrentUser();

  if (
    !user ||
    user.role !== "MANAGER" ||
    !user.restaurantId ||
    !user.restaurant
  ) {
    return null;
  }

  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}