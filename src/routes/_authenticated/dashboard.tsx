import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flight Price Notifier" },
      { name: "description", content: "Manage your flight fare alerts and target prices." },
      { property: "og:title", content: "Dashboard — Flight Price Notifier" },
      { property: "og:description", content: "Manage your flight fare alerts." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
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
