import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full min-w-[680px] text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }) {
  return <th className={cn("border-b border-slate-200 pb-3 pr-4 font-medium text-slate-500", className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn("border-b border-slate-100 py-4 pr-4 align-top text-slate-700", className)} {...props} />;
}
