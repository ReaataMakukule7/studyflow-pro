import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SubjectSheet } from "@/components/forms";
import { EmptyState, IconAction, PrimaryButton, ProgressBar, SubjectBadge } from "@/components/kit";
import { actions, subjectProgress, useStudyFlow, type Subject } from "@/lib/studyflow";
import { colorsFor } from "@/lib/subject-colors";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — StudyFlow" },
      {
        name: "description",
        content: "Add, edit and track progress for every school subject you study.",
      },
      { property: "og:title", content: "Subjects — StudyFlow" },
      {
        property: "og:description",
        content: "Add, edit and track progress for every school subject you study.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const state = useStudyFlow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const startEdit = (s: Subject) => {
    setEditing(s);
    setOpen(true);
  };

  return (
    <AppShell
      title="Subjects"
      aside={
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-mute">
          {state.subjects.length} active
        </p>
      }
    >
      <PrimaryButton onClick={startAdd} full>
        <span aria-hidden>+</span> Add subject
      </PrimaryButton>

      {state.subjects.length === 0 ? (
        <EmptyState text="No subjects yet. Add your first one to start planning." />
      ) : (
        <div className="space-y-2.5">
          {state.subjects.map((subject) => {
            const p = subjectProgress(state, subject.id);
            const c = colorsFor(subject.color);
            return (
              <article key={subject.id} className="sf-card p-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <SubjectBadge name={subject.name} color={subject.color} />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-sm font-semibold">{subject.name}</h2>
                    <p className="truncate text-xs text-mute">
                      {subject.teacher || "No teacher set"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <IconAction label={`Edit ${subject.name}`} onClick={() => startEdit(subject)}>
                      ✎
                    </IconAction>
                    <IconAction
                      label={`Delete ${subject.name}`}
                      tone="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${subject.name}? Its tasks and sessions will be removed too.`,
                          )
                        ) {
                          actions.deleteSubject(subject.id);
                        }
                      }}
                    >
                      ✕
                    </IconAction>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-mute">
                  <span>
                    {p.sessionsDone} of {p.sessionsTotal} sessions done
                  </span>
                  <span className={`font-display font-semibold ${c.text}`}>{p.pct}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={p.pct} color={subject.color} thick />
                </div>
                <p className="mt-2 text-xs text-mute">
                  {p.tasksDone} of {p.tasksTotal} tasks completed
                </p>
              </article>
            );
          })}
        </div>
      )}

      <SubjectSheet open={open} onClose={() => setOpen(false)} subject={editing} />
    </AppShell>
  );
}
