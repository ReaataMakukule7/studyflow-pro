import { useEffect, useState } from "react";
import {
  actions,
  todayISO,
  type Priority,
  type Session,
  type Subject,
  type Task,
  type TaskType,
} from "@/lib/studyflow";
import type { SubjectColor } from "@/lib/subject-colors";
import { ColorPicker, Field, GhostButton, PrimaryButton, Select, Sheet, TextArea, TextInput } from "./kit";

export function TaskSheet({
  open,
  onClose,
  subjects,
  task,
}: {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  task?: Task | null;
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [priority, setPriority] = useState<Priority>("medium");
  const [type, setType] = useState<TaskType>("assignment");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setSubjectId(task?.subjectId ?? subjects[0]?.id ?? "");
    setDueDate(task?.dueDate ?? todayISO());
    setPriority(task?.priority ?? "medium");
    setType(task?.type ?? "assignment");
  }, [open, task, subjects]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;
    const payload = { title: title.trim(), subjectId, dueDate, priority, type };
    if (task) actions.updateTask(task.id, payload);
    else actions.addTask(payload);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={task ? "Edit task" : "Add task"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 4 test"
            required
          />
        </Field>
        <Field label="Subject">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as TaskType)}>
              <option value="assignment">Assignment</option>
              <option value="test">Test / Exam</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>
        <Field label="Due date">
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <GhostButton onClick={onClose} full>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" full>
            {task ? "Save changes" : "Add task"}
          </PrimaryButton>
        </div>
      </form>
    </Sheet>
  );
}

export function SessionSheet({
  open,
  onClose,
  subjects,
  session,
}: {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  session?: Session | null;
}) {
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("16:00");
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubjectId(session?.subjectId ?? subjects[0]?.id ?? "");
    setDate(session?.date ?? todayISO());
    setStartTime(session?.startTime ?? "16:00");
    setDuration(session?.duration ?? 45);
    setNotes(session?.notes ?? "");
  }, [open, session, subjects]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    const payload = { subjectId, date, startTime, duration: Number(duration) || 30, notes: notes.trim() };
    if (session) actions.updateSession(session.id, payload);
    else actions.addSession(payload);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={session ? "Edit session" : "Plan study session"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Subject">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time">
            <TextInput
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </Field>
          <Field label="Duration (min)">
            <TextInput
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What will you cover?"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <GhostButton onClick={onClose} full>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" full>
            {session ? "Save changes" : "Add session"}
          </PrimaryButton>
        </div>
      </form>
    </Sheet>
  );
}

export function SubjectSheet({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  subject?: Subject | null;
}) {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState<SubjectColor>("math");

  useEffect(() => {
    if (!open) return;
    setName(subject?.name ?? "");
    setTeacher(subject?.teacher ?? "");
    setColor(subject?.color ?? "math");
  }, [open, subject]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), teacher: teacher.trim(), color };
    if (subject) actions.updateSubject(subject.id, payload);
    else actions.addSubject(payload);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={subject ? "Edit subject" : "Add subject"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Subject name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Geography"
            required
          />
        </Field>
        <Field label="Teacher (optional)">
          <TextInput value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Mr. Dlamini" />
        </Field>
        <Field label="Colour">
          <ColorPicker value={color} onChange={setColor} />
        </Field>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <GhostButton onClick={onClose} full>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" full>
            {subject ? "Save changes" : "Add subject"}
          </PrimaryButton>
        </div>
      </form>
    </Sheet>
  );
}
