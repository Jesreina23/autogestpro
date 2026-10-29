import { Header } from "@/components/layout/Header";
import { ClientTable } from "@/components/clientes/ClientTable";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: {
      _count: {
        select: { vehiculos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Directorio de Clientes"
        subtitle="Control de titulares de flotas, datos fiscales y unidades asignadas"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Padron Centralizado de Clientes
            </h2>
            <p className="text-xs text-slate-500">
              Registros sincronizados con la base de datos PostgreSQL
            </p>
          </div>

          <Link
            href="/clientes/nuevo"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Cliente</span>
          </Link>
        </div>

        <ClientTable initialClientes={clientes} />
      </main>
    </>
  );
}
