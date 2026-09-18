import { useEffect, type ReactNode } from "react";
import { colorsFor, SUBJECT_COLOR_KEYS, SUBJECT_COLORS, type SubjectColor } from "@/lib/subject-colors";

export function ProgressBar({
  value,
  color = "math",
  thick = false,
}: {
  value: number;
  color?: SubjectColor;
  thick?: boolean;
}) {
  const c = colorsFor(color);
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-ink/8 ${thick ? "h-2.5" : "h-1.5"}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`sf-fill h-full rounded-full ${c.bar}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function SubjectBadge({ name, color }: { name: string; color: SubjectColor }) {
  const c = colorsFor(color);
  return (
    <span
      className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-xs font-semibold ${c.soft} ${c.text}`}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function CheckCircle({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      aria-label={label}
      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs transition ${
        checked
          ? "sf-pop bg-life/15 text-life"
          : "border-2 border-mute/30 text-transparent hover:border-mute/60"
      }`}
    >
      ✓
    </button>
  );
}

export function SectionHeader({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="sf-label">{title}</h2>
      {meta ? <span className="text-xs text-mute">{meta}</span> : null}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="sf-card p-6 text-center text-sm text-mute">{text}</div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  full = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  full?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-2xl bg-accent px-4 py-3.5 font-display text-sm font-semibold text-accent-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  full = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  full?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-2xl bg-panel px-4 py-3.5 font-display text-sm font-semibold text-accent ring-1 ring-accent/20 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function IconAction({
  label,
  onClick,
  tone = "mute",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "mute" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-8 shrink-0 place-items-center rounded-xl text-sm transition hover:bg-ink/5 ${
        tone === "danger" ? "text-danger" : "text-mute"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- form primitives ---------------- */

const fieldClass =
  "w-full rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-mute/70";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.1em] text-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-20 resize-none`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={fieldClass} />;
}

export function ColorPicker({
  value,
  onChange,
}: {
  value: SubjectColor;
  onChange: (c: SubjectColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUBJECT_COLOR_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={SUBJECT_COLORS[key].label}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`size-8 rounded-full transition ${SUBJECT_COLORS[key].dot} ${
            value === key ? "ring-2 ring-ink ring-offset-2 ring-offset-panel" : "opacity-70"
          }`}
        />
      ))}
    </div>
  );
}

/* ---------------- sheet / modal ---------------- */

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sf-rise relative w-full max-w-[420px] rounded-t-3xl bg-panel p-5 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <IconAction label="Close" onClick={onClose}>
            ✕
          </IconAction>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-0.5">{children}</div>
      </div>
    </div>
  );
}
