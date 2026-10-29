import { EstadoMantenimiento } from "@/types";
import { cn } from "@/lib/utils";

interface BadgeProps {
  status: EstadoMantenimiento;
}

export function MaintenanceStatusBadge({ status }: BadgeProps) {
  const styles: Record<
    EstadoMantenimiento,
    { label: string; className: string; dotClass: string }
  > = {
    PENDIENTE: {
      label: "Pendiente",
      className: "bg-amber-50 text-amber-900 border-amber-200",
      dotClass: "bg-amber-500",
    },
    EN_PROCESO: {
      label: "En Proceso",
      className: "bg-sky-50 text-sky-900 border-sky-200",
      dotClass: "bg-sky-600",
    },
    COMPLETADO: {
      label: "Completado",
      className: "bg-emerald-50 text-emerald-900 border-emerald-200",
      dotClass: "bg-emerald-600",
    },
  };

  const current = styles[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border tracking-wide",
        current.className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dotClass)} />
      {current.label}
    </span>
  );
}

