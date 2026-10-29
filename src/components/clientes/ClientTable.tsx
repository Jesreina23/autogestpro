"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Mail, Phone, Car, Trash2, Eye, AlertTriangle, Loader2 } from "lucide-react";

export interface ClienteItem {
  id: string;
  nombre: string;
  documentoIdentidad: string | null;
  telefono: string | null;
  correo: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    vehiculos: number;
  };
}

interface ClientTableProps {
  initialClientes: ClienteItem[];
}

export function ClientTable({ initialClientes }: ClientTableProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteItem[]>(initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteAEliminar, setClienteAEliminar] = useState<ClienteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtrado de clientes en cliente
  const filteredClientes = clientes.filter((c) => {
    const term = searchTerm.toLowerCase();
    const nombre = c.nombre?.toLowerCase() || "";
    const doc = c.documentoIdentidad?.toLowerCase() || "";
    const correo = c.correo?.toLowerCase() || "";
    const tel = c.telefono?.toLowerCase() || "";
    return nombre.includes(term) || doc.includes(term) || correo.includes(term) || tel.includes(term);
  });

  const handleEliminarCliente = async () => {
    if (!clienteAEliminar) return;

    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch(`/api/clientes?id=${encodeURIComponent(clienteAEliminar.id)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el cliente.");
      }

      // Remover del estado local
      setClientes((prev) => prev.filter((c) => c.id !== clienteAEliminar.id));
      setFeedbackMessage({
        type: "success",
        text: `El cliente "${clienteAEliminar.nombre}" y sus unidades asociadas fueron eliminados correctamente.`,
      });
      setClienteAEliminar(null);
      router.refresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al procesar la eliminacion en la base de datos.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mensajes de feedback */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-md border text-xs flex items-center justify-between ${
            feedbackMessage.type === "success"
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
            placeholder="Buscar por razon social, documento, correo o telefono..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono self-end sm:self-auto">
          Total: <strong className="text-slate-800">{filteredClientes.length}</strong> {filteredClientes.length === 1 ? "cliente" : "clientes"}
        </span>
      </div>

      {/* Vista Movil: Tarjetas de Clientes (sin scroll horizontal) */}
      <div className="block md:hidden space-y-3">
        {filteredClientes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg">
            <p className="font-medium text-xs">No se encontraron clientes registrados</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchTerm ? "No hay resultados para la busqueda." : "Registre un cliente para comenzar."}
            </p>
          </div>
        ) : (
          filteredClientes.map((item) => (
            <div
              key={`mob-cli-${item.id}`}
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.nombre}
                  </h4>
                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {item.documentoIdentidad ? `Doc: ${item.documentoIdentidad}` : "Persona Natural"}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {item._count?.vehiculos ?? 0} {item._count?.vehiculos === 1 ? "vehiculo" : "vehiculos"}
                </span>
              </div>

              {/* Contacto */}
              {(item.correo || item.telefono) && (
                <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                  {item.correo && (
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.correo}</span>
                    </div>
                  )}
                  {item.telefono && (
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.telefono}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <Link
                  href={`/clientes/${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setClienteAEliminar(item)}
                  className="p-1.5 rounded border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-xs transition-colors"
                  title="Eliminar Cliente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla Corporativa de Escritorio (visible a partir de md: 768px) */}
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Razon Social / Nombre
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Documento de Identidad
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Contacto
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-center">
                  Vehiculos Vinculados
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="font-medium">No se encontraron clientes registrados</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm
                        ? "No hay resultados para la busqueda especificada."
                        : "Comience incorporando el primer titular desde el boton 'Registrar Nuevo Cliente'."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.nombre}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {item.documentoIdentidad ? (
                        item.documentoIdentidad
                      ) : (
                        <span className="text-slate-400 font-sans italic text-[11px]">Persona Natural</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {item.correo ? (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.correo}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sin correo</span>
                        )}
                        {item.telefono ? (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.telefono}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold border border-slate-200">
                        <Car className="w-3 h-3 text-slate-500" />
                        {item._count?.vehiculos ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          href={`/clientes/${item.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                          title="Ver Ficha Tecnica"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ficha</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setClienteAEliminar(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-medium transition-colors"
                          title="Eliminar Cliente"
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
      {clienteAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmar Eliminacion de Cliente
                  </h3>
                  <p className="text-xs text-slate-600">
                    ¿Esta seguro de que desea eliminar a{" "}
                    <strong className="text-slate-900">{clienteAEliminar.nombre}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold">Advertencia de Eliminacion en Cascada:</p>
                <p>
                  Esta accion eliminara permanentemente este cliente, junto con todas sus unidades vehiculares y el historial de mantenimientos vinculados.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setClienteAEliminar(null)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleEliminarCliente}
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

