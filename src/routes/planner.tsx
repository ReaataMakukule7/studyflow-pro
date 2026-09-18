import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SessionSheet } from "@/components/forms";
import {
  CheckCircle,
  EmptyState,
  IconAction,
  PrimaryButton,
  SectionHeader,
  SubjectBadge,
} from "@/components/kit";
import {
  actions,
  formatDayLong,
  formatTimeRange,
  relativeDay,
  subjectById,
  todayISO,
  useStudyFlow,
  type Session,
} from "@/lib/studyflow";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — StudyFlow" },
      {
        name: "description",
        content: "Plan study sessions by subject, date, time and duration, then tick them off.",
      },
      { property: "og:title", content: "Study Planner — StudyFlow" },
      {
        property: "og:description",
        content: "Plan study sessions by subject, date, time and duration, then tick them off.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const state = useStudyFlow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);

  const today = todayISO();
  const upcoming = state.sessions
    .filter((s) => s.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const past = state.sessions
    .filter((s) => s.date < today)
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

  const grouped = upcoming.reduce<Record<string, Session[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  const renderSession = (s: Session) => {
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
            {subject?.name ?? "Study session"}
          </p>
          <p className="text-xs text-mute">{formatTimeRange(s.startTime, s.duration)}</p>
          {s.notes ? <p className="mt-0.5 truncate text-xs text-mute/90">{s.notes}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <CheckCircle
            checked={s.completed}
            label="Mark session complete"
            onClick={() => actions.toggleSession(s.id)}
          />
          <IconAction
            label="Edit session"
            onClick={() => {
              setEditing(s);
              setOpen(true);
            }}
          >
            ✎
          </IconAction>
          <IconAction label="Delete session" tone="danger" onClick={() => actions.deleteSession(s.id)}>
            ✕
          </IconAction>
        </div>
      </div>
    );
  };

  return (
    <AppShell
      title="Study planner"
      aside={
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-mute">
          {upcoming.length} planned
        </p>
      }
    >
      <PrimaryButton
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        full
      >
        <span aria-hidden>◷</span> Plan study session
      </PrimaryButton>

      {upcoming.length === 0 ? (
        <EmptyState text="No sessions planned yet. Block out some study time." />
      ) : (
        Object.entries(grouped).map(([date, sessions]) => (
          <section key={date}>
            <SectionHeader
              title={relativeDay(date)}
              meta={<span suppressHydrationWarning>{formatDayLong(date)}</span>}
            />
            <div className="space-y-2.5">{sessions.map(renderSession)}</div>
          </section>
        ))
      )}

      {past.length > 0 && (
        <section>
          <SectionHeader title="Past sessions" meta={`${past.length} logged`} />
          <div className="space-y-2.5">{past.slice(0, 8).map(renderSession)}</div>
        </section>
      )}

      <SessionSheet
        open={open}
        onClose={() => setOpen(false)}
        subjects={state.subjects}
        session={editing}
      />
    </AppShell>
  );
}
