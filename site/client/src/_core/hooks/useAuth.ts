import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type AuthIdentity = {
  id: string | number;
  name: string | null;
  email: string | null;
  openId?: string;
  role?: "user" | "admin";
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const supabase = getSupabaseBrowserClient();
  const usingSupabase = Boolean(supabase);
  const [supabaseUser, setSupabaseUser] = useState<AuthIdentity | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(usingSupabase);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !usingSupabase,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  useEffect(() => {
    if (!supabase) {
      setSupabaseLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const currentUser = data.session?.user ?? null;
      setSupabaseUser(
        currentUser
          ? {
              id: currentUser.id,
              openId: `supabase:${currentUser.id}`,
              name:
                currentUser.user_metadata?.full_name ??
                currentUser.user_metadata?.name ??
                currentUser.email?.split("@")[0] ??
                null,
              email: currentUser.email ?? null,
              role: "user",
            }
          : null
      );
      setSupabaseLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setSupabaseUser(
        currentUser
          ? {
              id: currentUser.id,
              openId: `supabase:${currentUser.id}`,
              name:
                currentUser.user_metadata?.full_name ??
                currentUser.user_metadata?.name ??
                currentUser.email?.split("@")[0] ??
                null,
              email: currentUser.email ?? null,
              role: "user",
            }
          : null
      );
      setSupabaseLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSupabaseUser(null);
      return;
    }

    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, supabase, utils]);

  const state = useMemo(() => {
    const activeUser = usingSupabase ? supabaseUser : meQuery.data ?? null;
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(activeUser)
    );
    return {
      user: activeUser,
      loading: usingSupabase
        ? supabaseLoading || logoutMutation.isPending
        : meQuery.isLoading || logoutMutation.isPending,
      error: usingSupabase
        ? null
        : meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(activeUser),
    };
  }, [
    logoutMutation.error,
    logoutMutation.isPending,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    supabaseLoading,
    supabaseUser,
    usingSupabase,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: usingSupabase
      ? async () => undefined
      : () => meQuery.refetch(),
    logout,
  };
}
