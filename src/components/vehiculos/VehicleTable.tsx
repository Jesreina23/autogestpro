"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Vehiculo } from "@/types";
import { Wrench, Trash2, AlertTriangle, Loader2, Search, Car, User } from "lucide-react";

interface VehicleTableProps {
  vehiculos: Vehiculo[];
  onSelectVehicle?: (vehiculo: Vehiculo) => void;
}

export function VehicleTable({ vehiculos: initialVehiculos, onSelectVehicle }: VehicleTableProps) {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialVehiculos);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtrado reactivo en el cliente
  const filteredVehiculos = vehiculos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const marca = item.marca?.toLowerCase() || "";
    const modelo = item.modelo?.toLowerCase() || "";
    const anio = item.anio?.toString() || "";
    const cliente = item.cliente?.nombre?.toLowerCase() || "";
    const doc = item.cliente?.documentoIdentidad?.toLowerCase() || "";
    return marca.includes(term) || modelo.includes(term) || anio.includes(term) || cliente.includes(term) || doc.includes(term);
  });

  const handleEliminarVehiculo = async () => {
    if (!vehiculoAEliminar) return;

    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch(`/api/vehiculos?id=${encodeURIComponent(vehiculoAEliminar.id)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el vehiculo.");
      }

      setVehiculos((prev) => prev.filter((v) => v.id !== vehiculoAEliminar.id));
      setFeedbackMessage({
        type: "success",
        text: `El vehiculo ${vehiculoAEliminar.marca} ${vehiculoAEliminar.modelo} (${vehiculoAEliminar.anio}) fue eliminado correctamente.`,
      });
      setVehiculoAEliminar(null);
      router.refresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al eliminar el vehiculo de la base de datos.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-md border text-xs flex items-center justify-between ${feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[11px] underline ml-3 font-medium opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Buscador reactivo responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, marca, modelo o año..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono self-end sm:self-auto">
          Total unidades: <strong className="text-slate-800">{filteredVehiculos.length}</strong>
        </span>
      </div>

      {/* Vista Movil: Tarjetas de Vehiculos (sin scroll horizontal) */}
      <div className="block md:hidden space-y-3">
        {filteredVehiculos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg">
            <p className="font-medium text-xs">No se encontraron vehiculos registrados</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchTerm ? "No hay resultados para la busqueda." : "Registre un vehiculo para comenzar."}
            </p>
          </div>
        ) : (
          filteredVehiculos.map((item) => (
            <div
              key={`mob-veh-${item.id}`}
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.marca} {item.modelo}
                    </span>
                    {item.tipo && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.tipo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Año {item.anio} {item.placa ? `• Placa: ${item.placa}` : ""}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {item._count?.mantenimientos ?? 0} {item._count?.mantenimientos === 1 ? "servicio" : "servicios"}
                </span>
              </div>

              {/* Titular asociado */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                <span className="text-slate-500">Titular asociado:</span>
                <span className="font-semibold text-slate-800">
                  {item.cliente?.nombre ?? "Cliente General"}
                  {item.cliente?.documentoIdentidad ? ` (${item.cliente.documentoIdentidad})` : " (Persona Natural)"}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <Link
                  href={`/mantenimientos/nuevo?vehiculoId=${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Programar Servicio</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setVehiculoAEliminar(item)}
                  className="p-1.5 rounded border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-xs transition-colors"
                  title="Eliminar Vehiculo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla de Vehiculos de Escritorio (visible a partir de md: 768px) */}
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Cliente Titular Asociado
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Vehiculo (Marca y Modelo)
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Tipo
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Año
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-center">
                  Mantenimientos
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredVehiculos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-medium">No se encontraron vehiculos registrados</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm
                        ? "No hay resultados para la busqueda especificada."
                        : "Comience incorporando el primer vehiculo y vinculandolo a un cliente desde el boton superior."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVehiculos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Cliente Titular */}
                    <td className="py-3.5 px-4">
                      {item.cliente ? (
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.cliente.nombre}</span>
                          </div>
                          {item.cliente.documentoIdentidad ? (
                            <p className="text-[11px] text-slate-500 font-mono pl-5">
                              Doc: {item.cliente.documentoIdentidad}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic pl-5">
                              Persona Natural
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No asignado</span>
                      )}
                    </td>

                    {/* Marca y Modelo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-slate-600">
                          <Car className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">{item.marca}</span>{" "}
                          <span className="text-slate-700">{item.modelo}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tag / Tipo de Vehiculo */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {item.tipo || "Carro"}
                      </span>
                    </td>

                    {/* Año */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono font-medium">
                      {item.anio}
                    </td>

                    {/* Conteo de mantenimientos */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item._count?.mantenimientos ?? 0}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/mantenimientos/nuevo?vehiculoId=${item.id}`}
                          title="Programar Mantenimiento"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5 text-slate-500" />
                          <span>Servicio</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setVehiculoAEliminar(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-medium transition-colors"
                          title="Eliminar Vehiculo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmacion de Eliminacion */}
      {vehiculoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmar Eliminacion de Vehiculo
                  </h3>
                  <p className="text-xs text-slate-600">
                    ¿Esta seguro de que desea eliminar la unidad{" "}
                    <strong className="text-slate-900">
                      {vehiculoAEliminar.marca} {vehiculoAEliminar.modelo} ({vehiculoAEliminar.anio})
                    </strong>{" "}
                    vinculada a <strong className="text-slate-900">{vehiculoAEliminar.cliente?.nombre}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold">Advertencia de Eliminacion en Cascada:</p>
                <p>
                  Esta accion eliminara permanentemente el vehiculo y todas las ordenes de mantenimiento registradas para el.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVehiculoAEliminar(null)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleEliminarVehiculo}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
