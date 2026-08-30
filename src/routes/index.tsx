import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Price Notifier — 機票降價通知" },
      {
        name: "description",
        content:
          "Set a route and a target price — we email you when the fare drops. 監控台北出發熱門航線的最低票價。",
      },
      { property: "og:title", content: "Flight Price Notifier — 機票降價通知" },
      {
        property: "og:description",
        content: "Set a route and a target price — we email you when the fare drops.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: "✈️",
    title: "盯緊熱門航線",
    subtitle: "Always-on route watching",
    body: "持續監控台北出發的熱門航線（東京、首爾），自動抓最低票價。",
  },
  {
    icon: "🔔",
    title: "達標自動通知",
    subtitle: "Target-price email alerts",
    body: "低於你設定的目標價，就寄 email 提醒你，附上立即訂購連結。",
  },
  {
    icon: "🚫",
    title: "隨時取消",
    subtitle: "Cancel anytime",
    body: "月訂閱制，不想用隨時停，沒有綁約。",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-sm font-semibold tracking-tight sm:text-base">
          <span className="text-primary">✈</span> Flight Price Notifier
        </span>
        <Link
          to="/auth"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
        >
          Sign in / 登入
        </Link>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              台北出發 · 東京 / 首爾
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Flight Price Notifier
            </h1>
            <p className="mt-5 text-xl font-medium sm:text-2xl">
              設定航線與目標價，機票降價就通知你
            </p>
            <p className="mt-3 text-base text-muted-foreground">
              Set a route and a target price — we email you when the fare drops.
            </p>
            <Link
              to="/auth"
              className="mt-9 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Sign in / 登入
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="text-3xl">{f.icon}</div>
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="text-sm text-primary">{f.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
        © 2026 Flight Price Notifier
      </footer>
    </div>
  );
}
