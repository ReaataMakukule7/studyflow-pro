import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProgressBar, SectionHeader } from "@/components/kit";
import { overallProgress, subjectProgress, useStudyFlow, weeklyStats } from "@/lib/studyflow";
import { colorsFor } from "@/lib/subject-colors";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — StudyFlow" },
      {
        name: "description",
        content: "See overall study progress, subject breakdowns and weekly study statistics.",
      },
      { property: "og:title", content: "Progress — StudyFlow" },
      {
        property: "og:description",
        content: "See overall study progress, subject breakdowns and weekly study statistics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const state = useStudyFlow();
  const overall = overallProgress(state);
  const week = weeklyStats(state);
  const sessionsDone = state.sessions.filter((s) => s.completed).length;
  const tasksDone = state.tasks.filter((t) => t.completed).length;
  const hours = Math.floor(week.totalMinutes / 60);
  const mins = week.totalMinutes % 60;

  return (
    <AppShell title="Progress" aside={
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-mute">
        Last 7 days
      </p>
    }>
      <section className="rounded-3xl bg-accent p-5 text-accent-foreground ring-1 ring-white/10">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground/60">
          Overall progress
        </p>
        <p className="mt-1 font-display text-4xl font-semibold leading-none">{overall}%</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="sf-fill h-full rounded-full bg-gradient-to-r from-phys to-life"
            style={{ width: `${overall}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-accent-foreground/70">
          Across every session and task you've planned.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <div className="sf-card p-3.5 text-center">
          <p className="font-display text-2xl font-semibold">{sessionsDone}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-mute">Sessions done</p>
        </div>
        <div className="sf-card p-3.5 text-center">
          <p className="font-display text-2xl font-semibold">{tasksDone}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-mute">Tasks done</p>
        </div>
        <div className="sf-card p-3.5 text-center">
          <p className="font-display text-2xl font-semibold">
            {hours}
            <span className="text-sm">h</span> {mins}
            <span className="text-sm">m</span>
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-mute">Studied this week</p>
        </div>
      </section>

      <section>
        <SectionHeader title="Weekly study time" meta={`${week.totalMinutes} min`} />
        <div className="sf-card p-4">
          <div className="flex h-32 items-end justify-between gap-2">
            {week.days.map((d) => (
              <div key={d.iso} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end">
                  <div
                    className="sf-fill w-full rounded-t-lg bg-math/80"
                    style={{ height: `${Math.max(4, (d.minutes / week.max) * 100)}%` }}
                    title={`${d.minutes} min`}
                  />
                </div>
                <span className="font-display text-[10px] font-semibold text-mute">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Progress by subject" meta={`${state.subjects.length} subjects`} />
        <div className="space-y-2.5">
          {state.subjects.map((subject) => {
            const p = subjectProgress(state, subject.id);
            const c = colorsFor(subject.color);
            return (
              <div key={subject.id} className="sf-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-display text-sm font-semibold">{subject.name}</span>
                  <span className={`font-display text-xs font-semibold ${c.text}`}>{p.pct}%</span>
                </div>
                <div className="mt-2.5">
                  <ProgressBar value={p.pct} color={subject.color} thick />
                </div>
                <p className="mt-2 text-xs text-mute">
                  {p.sessionsDone}/{p.sessionsTotal} sessions · {p.tasksDone}/{p.tasksTotal} tasks
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
