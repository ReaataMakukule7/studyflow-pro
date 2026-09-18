import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TaskSheet } from "@/components/forms";
import {
  CheckCircle,
  EmptyState,
  IconAction,
  PrimaryButton,
  SectionHeader,
} from "@/components/kit";
import {
  actions,
  formatDayLong,
  PRIORITY_LABEL,
  relativeDay,
  subjectById,
  todayISO,
  useStudyFlow,
  type Task,
} from "@/lib/studyflow";
import { colorsFor } from "@/lib/subject-colors";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — StudyFlow" },
      {
        name: "description",
        content: "Track assignments and tests by due date, priority and subject.",
      },
      { property: "og:title", content: "Tasks — StudyFlow" },
      {
        property: "og:description",
        content: "Track assignments and tests by due date, priority and subject.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

const FILTERS = ["All", "Assignments", "Tests"] as const;

function TasksPage() {
  const state = useStudyFlow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const matches = (t: Task) =>
    filter === "All" ||
    (filter === "Assignments" && t.type === "assignment") ||
    (filter === "Tests" && t.type === "test");

  const sorted = [...state.tasks].filter(matches).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const open_ = sorted.filter((t) => !t.completed);
  const done = sorted.filter((t) => t.completed);

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const renderTask = (t: Task) => {
    const subject = subjectById(state, t.subjectId);
    const c = colorsFor(subject?.color);
    const overdue = !t.completed && t.dueDate < todayISO();
    return (
      <div key={t.id} className="sf-card flex items-center gap-3 p-3.5">
        <CheckCircle
          checked={t.completed}
          label={`Mark ${t.title} ${t.completed ? "incomplete" : "complete"}`}
          onClick={() => actions.toggleTask(t.id)}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-display text-sm font-semibold ${
              t.completed ? "text-mute line-through" : ""
            }`}
          >
            {t.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mute">
            <span className={`rounded-md px-1.5 py-0.5 font-display text-[10px] uppercase tracking-wide ${c.chip}`}>
              {subject?.name ?? "No subject"}
            </span>
            <span suppressHydrationWarning>{formatDayLong(t.dueDate)}</span>
            <span className={overdue ? "font-semibold text-danger" : ""} suppressHydrationWarning>
              {relativeDay(t.dueDate)}
            </span>
            <span>· {PRIORITY_LABEL[t.priority]} priority</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <IconAction
            label={`Edit ${t.title}`}
            onClick={() => {
              setEditing(t);
              setOpen(true);
            }}
          >
            ✎
          </IconAction>
          <IconAction label={`Delete ${t.title}`} tone="danger" onClick={() => actions.deleteTask(t.id)}>
            ✕
          </IconAction>
        </div>
      </div>
    );
  };

  return (
    <AppShell
      title="Tasks"
      aside={
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-mute">
          {open_.length} open
        </p>
      }
    >
      <PrimaryButton onClick={startAdd} full>
        <span aria-hidden>+</span> Add task
      </PrimaryButton>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition ${
              filter === f ? "bg-accent text-accent-foreground" : "bg-panel text-mute ring-1 ring-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section>
        <SectionHeader title="Upcoming" meta={`${open_.length} to do`} />
        {open_.length === 0 ? (
          <EmptyState text="Nothing outstanding. You're all caught up." />
        ) : (
          <div className="space-y-2.5">{open_.map(renderTask)}</div>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <SectionHeader title="Completed" meta={`${done.length} done`} />
          <div className="space-y-2.5">{done.map(renderTask)}</div>
        </section>
      )}

      <TaskSheet
        open={open}
        onClose={() => setOpen(false)}
        subjects={state.subjects}
        task={editing}
      />
    </AppShell>
  );
}
