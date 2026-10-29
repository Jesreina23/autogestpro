import { Header } from "@/components/layout/Header";
import { VehicleTable } from "@/components/vehiculos/VehicleTable";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VehiculosPage() {
  const vehiculos = await prisma.vehiculo.findMany({
    include: {
      cliente: true,
      _count: {
        select: { mantenimientos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Gestion de Vehiculos y Flota"
        subtitle="Registro tecnico de unidades automotrices sincronizadas en la base de datos"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Directorio de la Flota Vehicular
            </h2>
            <p className="text-xs text-slate-500">
              Unidades activas registradas en PostgreSQL
            </p>
          </div>

          <Link
            href="/vehiculos/nuevo"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Vehiculo</span>
          </Link>
        </div>

        <VehicleTable vehiculos={vehiculos} />
      </main>
    </>
  );
}
