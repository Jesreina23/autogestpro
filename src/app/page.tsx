import { Header } from "@/components/layout/Header";
import { VehicleTable } from "@/components/vehiculos/VehicleTable";
import { MaintenanceTable } from "@/components/mantenimientos/MaintenanceTable";
import { prisma } from "@/lib/prisma";
import {
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalVehiculos,
    pendientes,
    enProceso,
    completados,
    mantenimientosRecientes,
    vehiculosRecientes,
  ] = await Promise.all([
    prisma.vehiculo.count(),
    prisma.mantenimiento.count({ where: { estado: "PENDIENTE" } }),
    prisma.mantenimiento.count({ where: { estado: "EN_PROCESO" } }),
    prisma.mantenimiento.count({ where: { estado: "COMPLETADO" } }),
    prisma.mantenimiento.findMany({
      take: 5,
      orderBy: { fechaProgramada: "desc" },
      include: {
        vehiculo: {
          include: {
            cliente: true,
          },
        },
      },
    }),
    prisma.vehiculo.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: true,
        _count: {
          select: { mantenimientos: true },
        },
      },
    }),
  ]);

  return (
    <>
      <Header
        title="Centro de Control Operativo"
        subtitle="Monitoreo en tiempo real de flota, servicios en curso y programas tecnicos"
      />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
        {/* Metricas de Rendimiento Tecnico en Grid 2x2 en movil y 4 cols en escritorio */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-5 shadow-xs sm:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono truncate">
                Flota
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {totalVehiculos}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 ml-1.5 sm:ml-2">activas</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-5 shadow-xs sm:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wider font-mono truncate">
                Pendientes
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {pendientes}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 ml-1.5 sm:ml-2">por iniciar</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-5 shadow-xs sm:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-sky-700 uppercase tracking-wider font-mono truncate">
                En Proceso
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-sky-50 flex items-center justify-center text-sky-700 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {enProceso}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 ml-1.5 sm:ml-2">en taller</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-5 shadow-xs sm:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider font-mono truncate">
                Completados
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {completados}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 ml-1.5 sm:ml-2">cerradas</span>
            </div>
          </div>
        </section>

        {/* Seccion 1: Programa de Mantenimientos Recientes */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-900 font-mono">
                Programacion de Mantenimientos Recientes
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Seguimiento de ordenes de trabajo sincronizadas con PostgreSQL
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/mantenimientos"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/mantenimientos/nuevo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar</span>
              </Link>
            </div>
          </div>

          <MaintenanceTable mantenimientos={mantenimientosRecientes} />
        </section>

        {/* Seccion 2: Registro de Vehiculos de la Flota */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-900 font-mono">
                Registro de Vehiculos en Sistema
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Unidades vinculadas y su historial tecnico
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/vehiculos"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <span>Ver padron</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/vehiculos/nuevo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar</span>
              </Link>
            </div>
          </div>

          <VehicleTable vehiculos={vehiculosRecientes} />
        </section>
      </main>
    </>
  );
}
