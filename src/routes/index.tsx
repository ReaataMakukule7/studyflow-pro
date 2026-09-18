import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SessionSheet, TaskSheet } from "@/components/forms";
import {
  CheckCircle,
  EmptyState,
  GhostButton,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  SubjectBadge,
} from "@/components/kit";
import {
  actions,
  formatDayLong,
  formatTimeRange,
  overallProgress,
  relativeDay,
  sessionsOn,
  subjectById,
  subjectProgress,
  todayISO,
  upcomingTasks,
  useStudyFlow,
} from "@/lib/studyflow";
import { colorsFor } from "@/lib/subject-colors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyFlow — Plan smarter. Study better." },
      {
        name: "description",
        content:
          "StudyFlow helps high-school students organise subjects, assignments, tests and study sessions in one simple planner.",
      },
      { property: "og:title", content: "StudyFlow — Plan smarter. Study better." },
      {
        property: "og:description",
        content: "Your subjects, tasks, study sessions and progress in one mobile planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const state = useStudyFlow();
  const [taskOpen, setTaskOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const today = todayISO();
  const todaySessions = sessionsOn(state, today);
  const doneToday = todaySessions.filter((s) => s.completed).length;
  const overall = overallProgress(state);
  const upcoming = upcomingTasks(state).slice(0, 4);
  const remaining = todaySessions.length - doneToday;

  return (
    <AppShell
      title={`${greeting}, ${state.studentName}`}
      aside={
        <>
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-mute">
            Today
          </p>
          <p className="mt-0.5 font-display text-sm font-medium text-ink" suppressHydrationWarning>
            {formatDayLong(today)}
          </p>
        </>
      }
    >
      <section className="rounded-3xl bg-accent p-5 text-accent-foreground ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground/60">
              Overall progress
            </p>
            <p className="mt-1 font-display text-3xl font-semibold leading-none">{overall}%</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
            <span className="font-display text-sm font-semibold">{doneToday}</span>
            <span className="text-xs text-accent-foreground/60">/ {todaySessions.length} today</span>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="sf-fill h-full rounded-full bg-gradient-to-r from-phys to-life"
            style={{ width: `${overall}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-accent-foreground/70">
          {remaining > 0
            ? `You're on track. ${remaining} more session${remaining === 1 ? "" : "s"} to finish today.`
            : "Every session for today is done. Nice work."}
        </p>
      </section>

      <section>
        <SectionHeader
          title="Today's sessions"
          meta={`${todaySessions.length} planned`}
        />
        {todaySessions.length === 0 ? (
          <EmptyState text="No sessions planned for today. Add one below." />
        ) : (
          <div className="space-y-2.5">
            {todaySessions.map((s) => {
              const subject = subjectById(state, s.subjectId);
              return (
                <div key={s.id} className="sf-card flex items-center gap-3 p-3.5">
                  <SubjectBadge name={subject?.name ?? "?"} color={subject?.color ?? "math"} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-display text-sm font-semibold ${
                        s.completed ? "text-mute line-through" : ""
                      }`}
                    >
                      {s.notes || subject?.name || "Study session"}
                    </p>
                    <p className="text-xs text-mute">{formatTimeRange(s.startTime, s.duration)}</p>
                  </div>
                  <CheckCircle
                    checked={s.completed}
                    label={`Mark session complete`}
                    onClick={() => actions.toggleSession(s.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Upcoming" meta="By due date" />
        {upcoming.length === 0 ? (
          <EmptyState text="Nothing due. Add a task to stay ahead." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {upcoming.map((t) => {
              const subject = subjectById(state, t.subjectId);
              const c = colorsFor(subject?.color);
              return (
                <div key={t.id} className="sf-card p-3.5">
                  <p
                    className={`font-display text-[11px] font-semibold uppercase tracking-[0.1em] ${c.text}`}
                  >
                    {t.type === "test" ? "Test" : "Assignment"}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold leading-snug">{t.title}</p>
                  <p className="mt-2 text-xs text-mute" suppressHydrationWarning>
                    {formatDayLong(t.dueDate)} · {relativeDay(t.dueDate)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Subjects" meta={`${state.subjects.length} active`} />
        <div className="space-y-2.5">
          {state.subjects.map((subject) => {
            const p = subjectProgress(state, subject.id);
            const c = colorsFor(subject.color);
            return (
              <div key={subject.id} className="sf-card p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-display text-sm font-semibold">{subject.name}</span>
                  <span className={`font-display text-xs font-semibold ${c.text}`}>{p.pct}%</span>
                </div>
                <div className="mt-2.5">
                  <ProgressBar value={p.pct} color={subject.color} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5">
        <PrimaryButton onClick={() => setTaskOpen(true)} full>
          <span className="text-base leading-none" aria-hidden>
            +
          </span>{" "}
          Add Task
        </PrimaryButton>
        <GhostButton onClick={() => setSessionOpen(true)} full>
          <span className="text-base leading-none" aria-hidden>
            ◷
          </span>{" "}
          Plan Session
        </GhostButton>
      </section>

      <TaskSheet open={taskOpen} onClose={() => setTaskOpen(false)} subjects={state.subjects} />
      <SessionSheet
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        subjects={state.subjects}
      />
    </AppShell>
  );
}
