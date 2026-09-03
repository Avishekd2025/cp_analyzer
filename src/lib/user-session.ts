import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_HANDLE = "X_illUmiNatI";

/**
 * Resolves the active Codeforces handle for the current user session.
 * 1. Query parameter (?handle=...) has highest precedence for direct URLs / sharing.
 * 2. Cookie session (cf_handle) isolates concurrent users across browsers.
 * 3. Default fallback to DEFAULT_HANDLE ("X_illUmiNatI").
 */
export async function getActiveHandle(searchParamHandle?: string): Promise<string> {
  if (searchParamHandle && searchParamHandle.trim()) {
    return searchParamHandle.trim();
  }

  try {
    const cookieStore = await cookies();
    const cookieHandle = cookieStore.get("cf_handle")?.value?.trim();
    if (cookieHandle) {
      return cookieHandle;
    }
  } catch {
    // If called outside server request context
  }

  return DEFAULT_HANDLE;
}

/**
 * Fetches the user database profile for the currently active handle.
 */
export async function getActiveUser(searchParamHandle?: string) {
  const handle = await getActiveHandle(searchParamHandle);
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.codeforcesHandle, handle),
    });
    return { handle, user: user || null };
  } catch {
    return { handle, user: null };
  }
}
