import type { IncomingHttpHeaders } from "node:http";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { sdk } from "./sdk";
import { getSupabaseUser } from "./supabase";

export type RequestLike = {
  headers: IncomingHttpHeaders;
  protocol?: string;
};

export type ResponseLike = {
  clearCookie?: (name: string, options?: Record<string, unknown>) => unknown;
  setHeader?: (name: string, value: string | string[]) => unknown;
  end?: (body?: string) => unknown;
};

export type TrpcContext = {
  req: RequestLike;
  res: ResponseLike;
  user: User | null;
};

type ContextOptions = {
  req: RequestLike;
  res: ResponseLike;
};

export async function createContext(opts: ContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  const authorization = opts.req.headers.authorization;
  const bearerToken =
    typeof authorization === "string" && authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

  if (bearerToken) {
    const supabaseUser = await getSupabaseUser(bearerToken);
    if (supabaseUser) {
      const openId = `supabase:${supabaseUser.id}`;
      user = (await getUserByOpenId(openId)) ?? null;
      if (!user) {
        await upsertUser({
          openId,
          name:
            (supabaseUser.user_metadata?.full_name as string | undefined) ??
            (supabaseUser.user_metadata?.name as string | undefined) ??
            null,
          email: supabaseUser.email ?? null,
          loginMethod: "supabase",
        });
        user = (await getUserByOpenId(openId)) ?? null;
      }
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
