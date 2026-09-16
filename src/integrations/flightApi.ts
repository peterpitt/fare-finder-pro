// Client for the Flight Price Notifier AWS backend (API Gateway HTTP API).
// The base URL can be overridden at build time via VITE_API_BASE_URL; it
// defaults to the deployed API so no extra Vercel env var is required.
// Note: this backend holds only flight-subscription data (in DynamoDB).
// Supabase remains auth-only — no app data is stored there.

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ??
  "https://eg98nqxqmd.execute-api.us-east-1.amazonaws.com";

export type SubscriptionStatus =
  | "active"
  | "pending_payment"
  | "cancelled"
  | "expired";

export type Subscription = {
  email: string;
  route: string;
  plan_name: string;
  origin?: string;
  destination?: string;
  target_price: number;
  currency?: string;
  // M2 (payment) fields — absent on legacy M1 rows.
  subscription_status?: SubscriptionStatus;
  current_period_end?: string;
  current_period_end_date?: string;
  merchant_trade_no?: string;
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

// The /subscribe endpoint answers in one of two shapes (M2):
//  - text/html  → an ECPay auto-submit checkout form; hand the browser to it.
//  - application/json → an in-place update for an already-paid subscriber.
export type SaveResult =
  | { kind: "checkout"; html: string }
  | { kind: "updated"; data: unknown };

export async function saveSubscription(input: {
  email: string;
  plan_name: string;
  target_price: number;
}): Promise<SaveResult> {
  const res = await fetch(`${API_BASE_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Subscribe failed (${res.status}) ${detail}`);
  }
  const ctype = res.headers.get("content-type") ?? "";
  if (ctype.includes("text/html")) {
    return { kind: "checkout", html: await res.text() };
  }
  return { kind: "updated", data: await res.json().catch(() => ({})) };
}

export async function cancelSubscription(
  email: string,
  route: string,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, route }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Cancel failed (${res.status}) ${detail}`);
  }
}

// Replace the current document with ECPay's auto-submit form so the browser
// POSTs the user to the cashier. Navigates away from the SPA.
export function goToCheckout(html: string): void {
  document.open();
  document.write(html);
  document.close();
}
