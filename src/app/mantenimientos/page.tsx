import { Header } from "@/components/layout/Header";
import { MaintenanceTable } from "@/components/mantenimientos/MaintenanceTable";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MantenimientosPage() {
  const mantenimientos = await prisma.mantenimiento.findMany({
    include: {
      vehiculo: {
        include: {
          cliente: true,
        },
      },
    },
    orderBy: { fechaProgramada: "desc" },
  });

  return (
    <>
      <Header
        title="Programa de Mantenimientos"
        subtitle="Planificacion, control de ejecucion y registro historico en PostgreSQL"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Cronograma de Ordenes de Trabajo
            </h2>
            <p className="text-xs text-slate-500">
              Servicios tecnicos activos e historicos
            </p>
          </div>

          <Link
            href="/mantenimientos/nuevo"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Orden de Mantenimiento</span>
          </Link>
        </div>

        <MaintenanceTable mantenimientos={mantenimientos} />
      </main>
    </>
  );
}
