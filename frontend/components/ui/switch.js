import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-7 w-12 items-center rounded-full p-1 transition",
        checked ? "bg-brand-700" : "bg-slate-300",
        className
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
