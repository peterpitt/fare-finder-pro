// Client for the Flight Price Notifier AWS backend (API Gateway HTTP API).
// The base URL can be overridden at build time via VITE_API_BASE_URL; it
// defaults to the deployed API so no extra Vercel env var is required.
// Note: this backend holds only flight-subscription data (in DynamoDB).
// Supabase remains auth-only — no app data is stored there.

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ??
  "https://eg98nqxqmd.execute-api.us-east-1.amazonaws.com";

export type Subscription = {
  email: string;
  route: string;
  plan_name: string;
  origin?: string;
  destination?: string;
  target_price: number;
  currency?: string;
  updated_at?: string;
};

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(
    `${API_BASE_URL}/subscriptions?email=${encodeURIComponent(email)}`,
  );
  if (!res.ok) throw new Error(`Failed to load subscriptions (${res.status})`);
  const data = (await res.json()) as { subscriptions?: Subscription[] };
  return data.subscriptions ?? [];
}

export async function saveSubscription(input: {
  email: string;
  plan_name: string;
  target_price: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Subscribe failed (${res.status}) ${detail}`);
  }
}
