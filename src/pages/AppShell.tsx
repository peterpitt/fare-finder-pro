import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import {
  listSubscriptions,
  saveSubscription,
  type Subscription,
} from "@/integrations/flightApi";

type Plan = {
  plan_name: "tokyo" | "seoul";
  route: string;
  title: string;
  en: string;
  hint: string;
};

const PLANS: Plan[] = [
  {
    plan_name: "tokyo",
    route: "TPE-TYO",
    title: "台北 ✈ 東京",
    en: "Taipei → Tokyo",
    hint: "目前最低約 NT$6,386",
  },
  {
    plan_name: "seoul",
    route: "TPE-SEL",
    title: "台北 ✈ 首爾",
    en: "Taipei → Seoul",
    hint: "設定你想追蹤的目標價",
  },
];

function PlanCard({
  plan,
  sub,
  email,
  onSaved,
}: {
  plan: Plan;
  sub: Subscription | undefined;
  email: string;
  onSaved: () => void;
}) {
  const subscribed = Boolean(sub);
  const [editing, setEditing] = useState(!subscribed);
  const [value, setValue] = useState(sub ? String(sub.target_price) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditing(!subscribed);
    setValue(sub ? String(sub.target_price) : "");
  }, [subscribed, sub]);

  async function submit() {
    setError(null);
    const target = Number(value);
    if (!Number.isFinite(target) || target <= 0) {
      setError("請輸入大於 0 的目標價");
      return;
    }
    setSaving(true);
    try {
      await saveSubscription({
        email,
        plan_name: plan.plan_name,
        target_price: Math.round(target),
      });
      onSaved();
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "訂閱失敗，請再試一次");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-xs text-muted-foreground">{plan.en}</p>
        </div>
        {subscribed && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            已訂閱 · Subscribed
          </span>
        )}
      </div>

      {subscribed && !editing ? (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground">目前目標價</p>
          <p className="text-2xl font-bold text-primary">
            NT${sub!.target_price.toLocaleString()}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            更新目標價 · Update
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <label className="text-sm text-muted-foreground">
            目標價（TWD）— {plan.hint}
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">NT$</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="例如 10000"
              className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "處理中…" : subscribed ? "儲存 · Save" : "開始追蹤 · Track"}
            </button>
            {subscribed && (
              <button
                onClick={() => {
                  setEditing(false);
                  setValue(String(sub!.target_price));
                  setError(null);
                }}
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                取消
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async (email: string) => {
    try {
      const rows = await listSubscriptions(email);
      setSubs(rows);
    } catch {
      // Non-fatal: show the empty/subscribe state if the list can't load.
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      void refresh(user.email);
    }
  }, [user?.email, refresh]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }

  const byPlan = new Map(subs.map((s) => [s.plan_name, s]));

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
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {user?.email}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          設定航線與目標價，機票降價就 email 通知你（每 30 分鐘檢查一次）。
        </p>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            載入中…
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.plan_name}
                plan={plan}
                sub={byPlan.get(plan.plan_name)}
                email={user?.email ?? ""}
                onSaved={() => user?.email && refresh(user.email)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
