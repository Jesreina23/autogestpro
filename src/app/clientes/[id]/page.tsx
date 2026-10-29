import { Header } from "@/components/layout/Header";
import { DeleteClientButton } from "@/components/clientes/DeleteClientButton";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Mail, Phone, Car, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatFechaCorta } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ClienteDetalleProps {
  params: {
    id: string;
  };
}

export default async function ClienteDetallePage({ params }: ClienteDetalleProps) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      vehiculos: {
        include: {
          _count: {
            select: { mantenimientos: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cliente) {
    notFound();
  }

  return (
    <>
      <Header
        title="Ficha Tecnica de Cliente"
        subtitle={`Registro corporativo e historial de flota - ID: ${cliente.id}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al directorio de clientes</span>
          </Link>

          <DeleteClientButton clienteId={cliente.id} clienteNombre={cliente.nombre} />
        </div>

        {/* Tarjeta de Datos Fiscales y Contacto */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Razon Social / Titular
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {cliente.nombre}
              </h2>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-mono font-semibold rounded bg-slate-100 text-slate-800 border border-slate-200">
              {cliente.documentoIdentidad ? `Doc: ${cliente.documentoIdentidad}` : "Persona Natural"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Correo de Contacto</p>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{cliente.correo || "No registrado"}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Telefono Directo</p>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{cliente.telefono || "No registrado"}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Fecha de Registro</p>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span suppressHydrationWarning>{formatFechaCorta(cliente.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unidades Vinculadas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
              Unidades Vehiculares Vinculadas ({cliente.vehiculos.length})
            </h3>
            <Link
              href="/vehiculos/nuevo"
              className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Vincular Nuevo Vehiculo</span>
            </Link>
          </div>

          <div className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Marca y Modelo
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Año
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-center">
                    Mantenimientos
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-right">
                    Accion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {cliente.vehiculos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay vehiculos vinculados a este cliente aun.
                    </td>
                  </tr>
                ) : (
                  cliente.vehiculos.map((vehiculo) => (
                    <tr key={vehiculo.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <span>{vehiculo.marca} {vehiculo.modelo}</span>
                        {vehiculo.tipo && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {vehiculo.tipo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {vehiculo.anio}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {vehiculo._count?.mantenimientos ?? 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/vehiculos"
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Ver en Flota
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
