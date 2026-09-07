import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export default function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    });
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="text-sm font-semibold">
          <span className="text-primary">✈</span> Flight Price Notifier
        </span>
        <button
          onClick={signOut}
          className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Sign out / 登出
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-bold tracking-tight">你的降價通知．Your alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">Signed in as {user?.email}</p>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-3xl">🔔</div>
          <p className="mt-4 font-medium">還沒有任何航線通知</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Route watching and target-price alerts are coming next.
          </p>
        </div>
      </main>
    </div>
  );
}
