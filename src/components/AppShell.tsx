import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { hydrateStore } from "@/lib/studyflow";

const NAV = [
  { to: "/", label: "Home", glyph: "⌂" },
  { to: "/subjects", label: "Subjects", glyph: "◧" },
  { to: "/tasks", label: "Tasks", glyph: "☑" },
  { to: "/planner", label: "Planner", glyph: "▦" },
  { to: "/progress", label: "Progress", glyph: "◔" },
] as const;

export function AppShell({
  eyebrow = "StudyFlow",
  title,
  aside,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    hydrateStore();
  }, []);

  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <div className="relative mx-auto min-h-screen max-w-[420px] overflow-hidden">
        <div className="pointer-events-none absolute -inset-x-10 -top-24 h-[420px] -skew-y-6 bg-gradient-to-br from-math/25 via-phys/15 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute right-[-60px] top-64 size-56 -rotate-12 rounded-full bg-eng/15 blur-3xl" />

        <header className="sticky top-0 z-20 bg-paper/85 px-4 py-5 backdrop-blur-md">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-mute">
                {eyebrow}
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-semibold leading-none tracking-tight">
                {title}
              </h1>
            </div>
            {aside ? <div className="shrink-0 text-right">{aside}</div> : null}
          </div>
        </header>

        <main className="relative z-10 space-y-5 px-4 pb-32">{children}</main>

        <nav
          aria-label="Main"
          className="fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 px-4 pb-5"
        >
          <div className="flex items-center justify-between rounded-3xl bg-ink/[0.92] px-2 py-2 ring-1 ring-white/10 backdrop-blur">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 font-display text-[11px] font-medium text-white/50 transition data-[status=active]:bg-white/10 data-[status=active]:font-semibold data-[status=active]:text-white"
              >
                <span className="text-base leading-none" aria-hidden>
                  {item.glyph}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
