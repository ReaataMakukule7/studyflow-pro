export type SubjectColor = "math" | "phys" | "eng" | "life" | "rose" | "violet";

type ColorClasses = {
  label: string;
  dot: string;
  text: string;
  soft: string;
  bar: string;
  chip: string;
};

// Literal class strings so Tailwind always sees them in source.
export const SUBJECT_COLORS: Record<SubjectColor, ColorClasses> = {
  math: {
    label: "Blue",
    dot: "bg-math",
    text: "text-math",
    soft: "bg-math/12",
    bar: "bg-math",
    chip: "bg-math/12 text-math",
  },
  phys: {
    label: "Teal",
    dot: "bg-phys",
    text: "text-phys",
    soft: "bg-phys/12",
    bar: "bg-phys",
    chip: "bg-phys/12 text-phys",
  },
  eng: {
    label: "Amber",
    dot: "bg-eng",
    text: "text-eng",
    soft: "bg-eng/12",
    bar: "bg-eng",
    chip: "bg-eng/12 text-eng",
  },
  life: {
    label: "Green",
    dot: "bg-life",
    text: "text-life",
    soft: "bg-life/12",
    bar: "bg-life",
    chip: "bg-life/12 text-life",
  },
  rose: {
    label: "Rose",
    dot: "bg-rose",
    text: "text-rose",
    soft: "bg-rose/12",
    bar: "bg-rose",
    chip: "bg-rose/12 text-rose",
  },
  violet: {
    label: "Violet",
    dot: "bg-violet",
    text: "text-violet",
    soft: "bg-violet/12",
    bar: "bg-violet",
    chip: "bg-violet/12 text-violet",
  },
};

export const SUBJECT_COLOR_KEYS = Object.keys(SUBJECT_COLORS) as SubjectColor[];

export function colorsFor(color: SubjectColor | undefined): ColorClasses {
  return SUBJECT_COLORS[color ?? "math"];
}
