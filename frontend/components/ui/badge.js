import { cn } from "@/lib/utils";

const badgeStyles = {
  secondary: "bg-slate-100 text-slate-700",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800"
};

export function Badge({ className, variant = "secondary", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  );
}
