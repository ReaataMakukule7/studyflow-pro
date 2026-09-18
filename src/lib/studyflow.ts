import { useSyncExternalStore } from "react";
import type { SubjectColor } from "./subject-colors";

export type Priority = "low" | "medium" | "high";
export type TaskType = "assignment" | "test";

export type Subject = {
  id: string;
  name: string;
  teacher: string;
  color: SubjectColor;
};

export type Task = {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  type: TaskType;
  completed: boolean;
};

export type Session = {
  id: string;
  subjectId: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  duration: number; // minutes
  notes: string;
  completed: boolean;
};

export type AppState = {
  studentName: string;
  subjects: Subject[];
  tasks: Task[];
  sessions: Session[];
};

const STORAGE_KEY = "studyflow.v1";

/* ---------------- date helpers ---------------- */

export function toISODate(d: Date): string {
  const copy = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function shiftDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDayLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function relativeDay(iso: string): string {
  const diff = Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - new Date(`${todayISO()}T00:00:00`).getTime()) /
      86400000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `In ${diff} days`;
}

export function formatTimeRange(start: string, duration: number): string {
  const [h, m] = start.split(":").map(Number);
  const startMin = (h || 0) * 60 + (m || 0);
  const endMin = startMin + duration;
  const pad = (n: number) => String(n).padStart(2, "0");
  const end = `${pad(Math.floor(endMin / 60) % 24)}:${pad(endMin % 60)}`;
  return `${start} – ${end} · ${duration} min`;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ---------------- sample data ---------------- */

function seed(): AppState {
  const maths = uid();
  const phys = uid();
  const eng = uid();
  const life = uid();

  return {
    studentName: "Naledi",
    subjects: [
      { id: maths, name: "Mathematics", teacher: "Mr. Dlamini", color: "math" },
      { id: phys, name: "Physical Sciences", teacher: "Ms. Petersen", color: "phys" },
      { id: eng, name: "English", teacher: "Mrs. Naidoo", color: "eng" },
      { id: life, name: "Life Sciences", teacher: "Mr. Botha", color: "life" },
    ],
    tasks: [
      {
        id: uid(),
        title: "Chapter 4 test — Trigonometry",
        subjectId: maths,
        dueDate: shiftDays(3),
        priority: "high",
        type: "test",
        completed: false,
      },
      {
        id: uid(),
        title: "Ecosystems field report",
        subjectId: life,
        dueDate: shiftDays(6),
        priority: "medium",
        type: "assignment",
        completed: false,
      },
      {
        id: uid(),
        title: "Argumentative essay draft",
        subjectId: eng,
        dueDate: shiftDays(1),
        priority: "high",
        type: "assignment",
        completed: false,
      },
      {
        id: uid(),
        title: "Electric circuits class test",
        subjectId: phys,
        dueDate: shiftDays(8),
        priority: "medium",
        type: "test",
        completed: false,
      },
      {
        id: uid(),
        title: "Poetry analysis worksheet",
        subjectId: eng,
        dueDate: shiftDays(-2),
        priority: "low",
        type: "assignment",
        completed: true,
      },
      {
        id: uid(),
        title: "Algebra revision pack",
        subjectId: maths,
        dueDate: shiftDays(-4),
        priority: "medium",
        type: "assignment",
        completed: true,
      },
    ],
    sessions: [
      {
        id: uid(),
        subjectId: maths,
        date: todayISO(),
        startTime: "09:00",
        duration: 75,
        notes: "Differentiation from first principles",
        completed: true,
      },
      {
        id: uid(),
        subjectId: phys,
        date: todayISO(),
        startTime: "13:30",
        duration: 45,
        notes: "Waves & optics revision",
        completed: false,
      },
      {
        id: uid(),
        subjectId: eng,
        date: todayISO(),
        startTime: "16:00",
        duration: 60,
        notes: "Essay draft — structure and thesis",
        completed: false,
      },
      {
        id: uid(),
        subjectId: life,
        date: shiftDays(1),
        startTime: "15:00",
        duration: 40,
        notes: "Cell respiration summary",
        completed: false,
      },
      {
        id: uid(),
        subjectId: maths,
        date: shiftDays(-1),
        startTime: "17:00",
        duration: 60,
        notes: "Trig identities practice",
        completed: true,
      },
      {
        id: uid(),
        subjectId: phys,
        date: shiftDays(-2),
        startTime: "16:30",
        duration: 50,
        notes: "Ohm's law problems",
        completed: true,
      },
      {
        id: uid(),
        subjectId: eng,
        date: shiftDays(-3),
        startTime: "18:00",
        duration: 45,
        notes: "Reading — Jane Eyre ch. 12-15",
        completed: true,
      },
      {
        id: uid(),
        subjectId: life,
        date: shiftDays(-4),
        startTime: "15:30",
        duration: 35,
        notes: "Photosynthesis diagrams",
        completed: true,
      },
      {
        id: uid(),
        subjectId: maths,
        date: shiftDays(-5),
        startTime: "16:00",
        duration: 55,
        notes: "Past paper section A",
        completed: true,
      },
    ],
  };
}

/* ---------------- store ---------------- */

let state: AppState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.subjects)) {
        state = { ...seed(), ...parsed };
        emit();
        return;
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  persist();
}

function set(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStudyFlow(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

/* ---------------- actions ---------------- */

export const actions = {
  setStudentName(name: string) {
    set((s) => ({ ...s, studentName: name.trim() || s.studentName }));
  },
  addSubject(data: Omit<Subject, "id">) {
    set((s) => ({ ...s, subjects: [...s.subjects, { ...data, id: uid() }] }));
  },
  updateSubject(id: string, data: Omit<Subject, "id">) {
    set((s) => ({
      ...s,
      subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...data } : x)),
    }));
  },
  deleteSubject(id: string) {
    set((s) => ({
      ...s,
      subjects: s.subjects.filter((x) => x.id !== id),
      tasks: s.tasks.filter((t) => t.subjectId !== id),
      sessions: s.sessions.filter((x) => x.subjectId !== id),
    }));
  },
  addTask(data: Omit<Task, "id" | "completed">) {
    set((s) => ({ ...s, tasks: [...s.tasks, { ...data, id: uid(), completed: false }] }));
  },
  updateTask(id: string, data: Partial<Omit<Task, "id">>) {
    set((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
  },
  toggleTask(id: string) {
    set((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  },
  deleteTask(id: string) {
    set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  addSession(data: Omit<Session, "id" | "completed">) {
    set((s) => ({
      ...s,
      sessions: [...s.sessions, { ...data, id: uid(), completed: false }],
    }));
  },
  updateSession(id: string, data: Partial<Omit<Session, "id">>) {
    set((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...data } : x)),
    }));
  },
  toggleSession(id: string) {
    set((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)),
    }));
  },
  deleteSession(id: string) {
    set((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  },
  resetToSample() {
    set(() => seed());
  },
};

/* ---------------- derived ---------------- */

export function subjectById(s: AppState, id: string): Subject | undefined {
  return s.subjects.find((x) => x.id === id);
}

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function subjectProgress(s: AppState, subjectId: string) {
  const sessions = s.sessions.filter((x) => x.subjectId === subjectId);
  const tasks = s.tasks.filter((t) => t.subjectId === subjectId);
  const done = sessions.filter((x) => x.completed).length + tasks.filter((t) => t.completed).length;
  const total = sessions.length + tasks.length;
  return {
    sessionsDone: sessions.filter((x) => x.completed).length,
    sessionsTotal: sessions.length,
    tasksDone: tasks.filter((t) => t.completed).length,
    tasksTotal: tasks.length,
    pct: percent(done, total),
  };
}

export function overallProgress(s: AppState) {
  const done = s.sessions.filter((x) => x.completed).length + s.tasks.filter((t) => t.completed).length;
  const total = s.sessions.length + s.tasks.length;
  return percent(done, total);
}

export function weeklyStats(s: AppState) {
  const days: { label: string; iso: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    const minutes = s.sessions
      .filter((x) => x.date === iso && x.completed)
      .reduce((sum, x) => sum + x.duration, 0);
    days.push({ label: d.toLocaleDateString(undefined, { weekday: "narrow" }), iso, minutes });
  }
  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
  const max = Math.max(60, ...days.map((d) => d.minutes));
  return { days, totalMinutes, max };
}

export function upcomingTasks(s: AppState) {
  return s.tasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function sessionsOn(s: AppState, iso: string) {
  return s.sessions
    .filter((x) => x.date === iso)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
