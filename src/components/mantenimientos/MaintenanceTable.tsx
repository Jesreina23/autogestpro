"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mantenimiento, EstadoMantenimiento } from "@/types";
import { MaintenanceStatusBadge } from "@/components/ui/Badge";
import {
  Calendar,
  Trash2,
  AlertTriangle,
  Loader2,
  Search,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  DollarSign,
  Clock,
  Edit,
  PlusCircle,
  Calculator,
  ArrowRightLeft,
} from "lucide-react";
import { formatKilometraje, formatBolivares, formatFechaCorta } from "@/lib/utils";

interface MaintenanceTableProps {
  mantenimientos: Mantenimiento[];
  onSelectMaintenance?: (mantenimiento: Mantenimiento) => void;
}

export function MaintenanceTable({
  mantenimientos: initialMantenimientos,
  onSelectMaintenance,
}: MaintenanceTableProps) {
  const router = useRouter();
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>(initialMantenimientos);
  const [searchTerm, setSearchTerm] = useState("");
  const [ordenAEliminar, setOrdenAEliminar] = useState<Mantenimiento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal para Cargar/Actualizar Costos y Horas despues
  const [ordenAEditar, setOrdenAEditar] = useState<Mantenimiento | null>(null);
  const [editForm, setEditForm] = useState({
    horasHombre: "",
    costoManoObra: "",
    costoManoObraBs: "",
    tasaCambio: "",
    kilometraje: "",
    esGarantia: false,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [tipoTasaModal, setTipoTasaModal] = useState<"BCV" | "USDT" | "MANUAL">("BCV");
  const [tasasData, setTasasData] = useState<{
    usdBcv: number;
    eurBcv: number;
    usdt: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/tasas")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setTasasData(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const formatDate = (dateValue: Date | string) => {
    return formatFechaCorta(dateValue);
  };

  const filteredMantenimientos = mantenimientos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const placa = item.vehiculo?.placa?.toLowerCase() || "";
    const marca = item.vehiculo?.marca?.toLowerCase() || "";
    const cliente = item.vehiculo?.cliente?.nombre?.toLowerCase() || "";
    const desc = item.descripcionServicio?.toLowerCase() || "";
    const estado = item.estado?.toLowerCase() || "";
    return placa.includes(term) || marca.includes(term) || cliente.includes(term) || desc.includes(term) || estado.includes(term);
  });

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoMantenimiento) => {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/mantenimientos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado.");
      }

      setMantenimientos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item))
      );
      setFeedbackMessage({
        type: "success",
        text: `Estado de la orden actualizado a ${nuevoEstado}.`,
      });
      router.refresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al actualizar la orden.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenEditModal = (item: Mantenimiento) => {
    const activeTasa = item.tasaCambio || tasasData?.usdBcv || 888.12;
    let initialBs = "";
    if (item.costoManoObraBs != null) {
      initialBs = String(item.costoManoObraBs);
    } else if (item.costoManoObra != null && activeTasa > 0) {
      initialBs = (item.costoManoObra * activeTasa).toFixed(2);
    }

    setOrdenAEditar(item);
    setTipoTasaModal("BCV");
    setEditForm({
      horasHombre: item.horasHombre != null ? String(item.horasHombre) : "",
      costoManoObra: item.costoManoObra != null ? String(item.costoManoObra) : "",
      costoManoObraBs: initialBs,
      tasaCambio: String(activeTasa),
      kilometraje: item.kilometraje != null ? String(item.kilometraje) : "",
      esGarantia: Boolean(item.esGarantia),
    });
  };

  // Conversion en tiempo real en modal
  const handleEditUsdChange = (val: string) => {
    const tasa = parseFloat(editForm.tasaCambio);
    const usdNum = parseFloat(val);
    if (!isNaN(usdNum) && !isNaN(tasa) && tasa > 0) {
      setEditForm((prev) => ({
        ...prev,
        costoManoObra: val,
        costoManoObraBs: (usdNum * tasa).toFixed(2),
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        costoManoObra: val,
        costoManoObraBs: val === "" ? "" : prev.costoManoObraBs,
      }));
    }
  };

  const handleEditBsChange = (val: string) => {
    const tasa = parseFloat(editForm.tasaCambio);
    const bsNum = parseFloat(val);
    if (!isNaN(bsNum) && !isNaN(tasa) && tasa > 0) {
      setEditForm((prev) => ({
        ...prev,
        costoManoObraBs: val,
        costoManoObra: (bsNum / tasa).toFixed(2),
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        costoManoObraBs: val,
        costoManoObra: val === "" ? "" : prev.costoManoObra,
      }));
    }
  };

  const handleEditSeleccionarTasa = (tipo: "BCV" | "USDT" | "MANUAL") => {
    setTipoTasaModal(tipo);
    let nuevaTasa = parseFloat(editForm.tasaCambio) || 1;
    if (tipo === "BCV" && tasasData?.usdBcv) {
      nuevaTasa = tasasData.usdBcv;
    } else if (tipo === "USDT" && tasasData?.usdt) {
      nuevaTasa = tasasData.usdt;
    }

    setEditForm((prev) => {
      const usdNum = parseFloat(prev.costoManoObra);
      const bsCalculado = !isNaN(usdNum) && nuevaTasa > 0 ? (usdNum * nuevaTasa).toFixed(2) : prev.costoManoObraBs;
      return {
        ...prev,
        tasaCambio: String(nuevaTasa),
        costoManoObraBs: bsCalculado,
      };
    });
  };

  const handleEditTasaManualChange = (val: string) => {
    setTipoTasaModal("MANUAL");
    const nuevaTasa = parseFloat(val);
    setEditForm((prev) => {
      const usdNum = parseFloat(prev.costoManoObra);
      const bsCalculado = !isNaN(usdNum) && !isNaN(nuevaTasa) && nuevaTasa > 0 ? (usdNum * nuevaTasa).toFixed(2) : prev.costoManoObraBs;
      return {
        ...prev,
        tasaCambio: val,
        costoManoObraBs: bsCalculado,
      };
    });
  };

  const handleGuardarFinanzas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenAEditar) return;

    setIsSavingEdit(true);
    try {
      const payload = {
        id: ordenAEditar.id,
        horasHombre: editForm.horasHombre !== "" ? Number(editForm.horasHombre) : null,
        costoManoObra: editForm.costoManoObra !== "" ? Number(editForm.costoManoObra) : null,
        costoManoObraBs: editForm.costoManoObraBs !== "" ? Number(editForm.costoManoObraBs) : null,
        tasaCambio: editForm.tasaCambio !== "" ? Number(editForm.tasaCambio) : null,
        kilometraje: editForm.kilometraje !== "" ? Number(editForm.kilometraje) : null,
        esGarantia: editForm.esGarantia,
      };

      const res = await fetch("/api/mantenimientos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar los costos de la orden.");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id === ordenAEditar.id
            ? {
                ...m,
                horasHombre: payload.horasHombre,
                costoManoObra: payload.costoManoObra,
                costoManoObraBs: payload.costoManoObraBs,
                tasaCambio: payload.tasaCambio,
                kilometraje: payload.kilometraje,
                esGarantia: payload.esGarantia,
              }
            : m
        )
      );

      setFeedbackMessage({
        type: "success",
        text: `Costos y parametros de la orden #${ordenAEditar.id.slice(0, 8).toUpperCase()} actualizados correctamente.`,
      });
      setOrdenAEditar(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "No se pudo actualizar los costos.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEliminarMantenimiento = async () => {
    if (!ordenAEliminar) return;

    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch(`/api/mantenimientos?id=${encodeURIComponent(ordenAEliminar.id)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar la orden.");
      }

      setMantenimientos((prev) => prev.filter((m) => m.id !== ordenAEliminar.id));
      setFeedbackMessage({
        type: "success",
        text: "Orden de mantenimiento eliminada correctamente.",
      });
      setOrdenAEliminar(null);
      router.refresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error al eliminar la orden.",
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
            placeholder="Buscar por placa, cliente, descripcion o estado..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono self-end sm:self-auto">
          Total ordenes: <strong className="text-slate-800">{filteredMantenimientos.length}</strong>
        </span>
      </div>

      {/* Vista Movil: Tarjetas Optimizadas (sin necesidad de scroll horizontal) */}
      <div className="block md:hidden space-y-3">
        {filteredMantenimientos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg">
            <p className="font-medium text-xs">No hay ordenes de mantenimiento registradas</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchTerm ? "No hay resultados para la busqueda especificada." : "Cree una orden para comenzar."}
            </p>
          </div>
        ) : (
          filteredMantenimientos.map((item) => (
            <div
              key={`mob-${item.id}`}
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5 text-xs"
            >
              {/* Cabecera de la tarjeta: ID, Fecha y Estado */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    #{item.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="text-[11px] text-slate-500 font-mono flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(item.fechaProgramada)}
                  </span>
                </div>

                <MaintenanceStatusBadge status={item.estado} />
              </div>

              {/* Informacion del Vehiculo y Titular */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.vehiculo?.marca} {item.vehiculo?.modelo}
                    </span>
                    {item.vehiculo?.tipo && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.vehiculo.tipo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Año {item.vehiculo?.anio} {item.vehiculo?.placa ? `• Placa: ${item.vehiculo.placa}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Titular
                  </span>
                  <span className="font-medium text-slate-800 text-xs">
                    {item.vehiculo?.cliente?.nombre ?? "Cliente General"}
                  </span>
                </div>
              </div>

              {/* Descripcion del Servicio */}
              <div className="p-2.5 rounded bg-slate-50/80 border border-slate-100 space-y-1.5">
                <p className="text-slate-800 text-xs font-medium leading-relaxed">
                  {item.descripcionServicio}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {item.kilometraje != null && (
                    <span
                      suppressHydrationWarning
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      <Gauge className="w-3 h-3 text-slate-500" />
                      {formatKilometraje(item.kilometraje)} km
                    </span>
                  )}

                  {item.esGarantia && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      Garantia
                    </span>
                  )}

                  {item.horasHombre != null && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-white border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.horasHombre}h
                    </span>
                  )}

                  {item.costoManoObra != null ? (
                    <div className="inline-flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        ${item.costoManoObra.toFixed(2)}
                      </span>
                      {item.costoManoObraBs != null && (
                        <span
                          suppressHydrationWarning
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700 bg-white border border-slate-200"
                        >
                          <span className="font-semibold text-sky-800 text-[9px]">Bs.</span>
                          {formatBolivares(item.costoManoObraBs)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-white hover:bg-slate-100 border border-dashed border-slate-300 transition-colors"
                    >
                      <PlusCircle className="w-3 h-3 text-slate-400" />
                      <span>+ Cargar costos</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Acciones y Selector de Estado en Movil */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">Estado:</span>
                  <select
                    disabled={updatingId === item.id}
                    value={item.estado}
                    onChange={(e) =>
                      handleCambiarEstado(item.id, e.target.value as EstadoMantenimiento)
                    }
                    className="text-[11px] font-medium bg-slate-50 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer"
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="EN_PROCESO">EN_PROCESO</option>
                    <option value="COMPLETADO">COMPLETADO</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition-colors"
                  >
                    <DollarSign className="w-3 h-3 text-slate-500" />
                    <span>Costos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdenAEliminar(item)}
                    className="p-1.5 rounded border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-xs transition-colors"
                    title="Eliminar Orden"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla de Mantenimientos de Escritorio (visible a partir de md: 768px) */}
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Orden ID
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Vehiculo
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Cliente Titular
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Fecha
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Servicio y Parametros Financieros
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Estado
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMantenimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-medium">No hay ordenes de mantenimiento registradas</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm
                        ? "No hay resultados para la busqueda especificada."
                        : "Comience programando el primer servicio tecnico con el boton superior."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMantenimientos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID de la orden */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-[11px]">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </td>

                    {/* Datos del vehiculo */}
                    <td className="py-3.5 px-4">
                      {item.vehiculo ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">
                              {item.vehiculo.marca} {item.vehiculo.modelo}
                            </span>
                            {item.vehiculo.tipo && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                {item.vehiculo.tipo}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Año {item.vehiculo.anio}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No asignado</span>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium">
                        {item.vehiculo?.cliente?.nombre ?? "Cliente General"}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span suppressHydrationWarning>{formatDate(item.fechaProgramada)}</span>
                      </div>
                    </td>

                    {/* Descripcion y Detalles Operativos/Financieros */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="space-y-1">
                        <p className="text-slate-800 line-clamp-2" title={item.descripcionServicio}>
                          {item.descripcionServicio}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {item.kilometraje != null && (
                            <span
                              suppressHydrationWarning
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <Gauge className="w-3 h-3 text-slate-500" />
                              {formatKilometraje(item.kilometraje)} km
                            </span>
                          )}

                          {item.esGarantia && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              Garantia
                            </span>
                          )}

                          {item.horasHombre != null && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.horasHombre}h
                            </span>
                          )}

                          {item.costoManoObra != null ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                <DollarSign className="w-3 h-3 text-emerald-600" />
                                ${item.costoManoObra.toFixed(2)}
                              </span>
                              {item.costoManoObraBs != null ? (
                                <span
                                  suppressHydrationWarning
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700 bg-slate-100 border border-slate-200"
                                  title={`Tasa aplicada: ${item.tasaCambio ? item.tasaCambio.toFixed(2) + " Bs./$" : "Registrada"}`}
                                >
                                  <span className="font-semibold text-sky-800 text-[9px]">Bs.</span>
                                  {formatBolivares(item.costoManoObraBs)}
                                </span>
                              ) : tasasData?.usdBcv ? (
                                <span
                                  suppressHydrationWarning
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200"
                                  title="Equivalente a tasa BCV del dia"
                                >
                                  <span className="text-[9px] font-semibold text-slate-600">~Bs.</span>
                                  {formatBolivares(item.costoManoObra * tasasData.usdBcv)}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 transition-colors"
                              title="Registrar costo de mano de obra y horas invertidas"
                            >
                              <PlusCircle className="w-3 h-3 text-slate-400" />
                              <span>+ Cargar costos</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Estado con selector rapido */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          disabled={updatingId === item.id}
                          value={item.estado}
                          onChange={(e) =>
                            handleCambiarEstado(item.id, e.target.value as EstadoMantenimiento)
                          }
                          className="text-[11px] font-medium bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer"
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="EN_PROCESO">EN PROCESO</option>
                          <option value="COMPLETADO">COMPLETADO</option>
                        </select>
                        {updatingId === item.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                          title="Cargar o modificar costo y horas hombre"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                          <span>Costos</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrdenAEliminar(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-medium transition-colors"
                          title="Eliminar Orden"
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

      {/* Modal para Cargar/Modificar Costos, Horas y Finanzas a posteriori */}
      {ordenAEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Cargar / Actualizar Costos de la Orden</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Orden #{ordenAEditar.id.slice(0, 8).toUpperCase()} — {ordenAEditar.vehiculo?.marca} {ordenAEditar.vehiculo?.modelo}
                  </p>
                </div>
              </div>

              <form onSubmit={handleGuardarFinanzas} className="space-y-4">
                {/* Panel de Conversion de Divisa y Tasa */}
                <div className="p-3 bg-slate-50/80 rounded-md border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 font-mono">
                      <Calculator className="w-3.5 h-3.5 text-slate-500" />
                      <span>Calculo Dual ($ / Bs.)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {tasasData?.usdBcv && (
                        <button
                          type="button"
                          onClick={() => handleEditSeleccionarTasa("BCV")}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            tipoTasaModal === "BCV"
                              ? "bg-slate-900 text-white font-semibold"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          BCV: {tasasData.usdBcv.toFixed(2)}
                        </button>
                      )}
                      {tasasData?.usdt && (
                        <button
                          type="button"
                          onClick={() => handleEditSeleccionarTasa("USDT")}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            tipoTasaModal === "USDT"
                              ? "bg-slate-900 text-white font-semibold"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          USDT: {tasasData.usdt.toFixed(2)}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditSeleccionarTasa("MANUAL")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          tipoTasaModal === "MANUAL"
                            ? "bg-slate-900 text-white font-semibold"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                    {/* Costo en USD */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>Monto en $ (USD)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs font-mono text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={editForm.costoManoObra}
                          onChange={(e) => handleEditUsdChange(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-6 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                      </div>
                    </div>

                    {/* Tasa de Cambio */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                          <span>Tasa (Bs./$)</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {tipoTasaModal === "BCV" ? "BCV" : tipoTasaModal === "USDT" ? "USDT" : "Libre"}
                        </span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0.01}
                        value={editForm.tasaCambio}
                        onChange={(e) => handleEditTasaManualChange(e.target.value)}
                        placeholder="888.12"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    {/* Costo en Bs. */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <span className="font-semibold text-sky-700 text-[10px]">Bs.</span>
                        <span>Monto en Bs.</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs font-mono text-slate-400">Bs.</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={editForm.costoManoObraBs}
                          onChange={(e) => handleEditBsChange(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Horas Hombre */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Horas Hombre (h)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={editForm.horasHombre}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, horasHombre: e.target.value }))}
                      placeholder="Ej. 3.5"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  {/* Kilometraje */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Kilometraje (km)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.kilometraje}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, kilometraje: e.target.value }))}
                      placeholder="Ej. 65000"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  {/* Check de Garantia */}
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.esGarantia}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, esGarantia: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Trabajo amparado por garantia</span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Marque si el trabajo no tendra cobro por corresponder a una garantia tecnica.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => setOrdenAEditar(null)}
                    className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardar Parametros Financieros</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacion de Eliminacion */}
      {ordenAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmar Eliminacion de Orden
                  </h3>
                  <p className="text-xs text-slate-600">
                    ¿Esta seguro de que desea eliminar la orden{" "}
                    <strong className="text-slate-900 font-mono">
                      #{ordenAEliminar.id.slice(0, 8).toUpperCase()}
                    </strong>{" "}
                    del vehiculo{" "}
                    <strong className="text-slate-900">
                      {ordenAEliminar.vehiculo?.marca} {ordenAEliminar.vehiculo?.modelo} (Titular: {ordenAEliminar.vehiculo?.cliente?.nombre})
                    </strong>?
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Esta accion removera el registro del cronograma de mantenimientos permanentemente.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrdenAEliminar(null)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleEliminarMantenimiento}
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
                    <span>Eliminar Orden</span>
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
