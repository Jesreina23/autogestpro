"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Gauge,
  DollarSign,
  Clock,
  ShieldCheck,
  Plus,
  Loader2,
  ArrowRightLeft,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { Vehiculo } from "@/types";

interface OpcionCatalogo {
  id: string;
  valor: string;
}

export default function NuevoMantenimientoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    vehiculoId: "",
    fechaProgramada: new Date().toISOString().split("T")[0],
    tipoServicio: "",
    detallesAdicionales: "",
    estado: "PENDIENTE",
    kilometraje: "",
    horasHombre: "",
    costoManoObra: "",
    costoManoObraBs: "",
    tasaCambio: "",
    esGarantia: false,
  });

  const [tasasData, setTasasData] = useState<{
    usdBcv: number;
    eurBcv: number;
    usdt: number;
  } | null>(null);
  const [tipoTasa, setTipoTasa] = useState<"BCV" | "USDT" | "MANUAL">("BCV");

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [plantillasServicio, setPlantillasServicio] = useState<OpcionCatalogo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal para agregar nuevo tipo de servicio al vuelo
  const [showAddServicioModal, setShowAddServicioModal] = useState(false);
  const [nuevoServicioInput, setNuevoServicioInput] = useState("");
  const [isSavingServicio, setIsSavingServicio] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resVehiculos, resPlantillas, resTasas] = await Promise.all([
          fetch("/api/vehiculos"),
          fetch("/api/catalogos?categoria=TIPO_SERVICIO"),
          fetch("/api/tasas"),
        ]);

        const jsonVehiculos = await resVehiculos.json();
        const jsonPlantillas = await resPlantillas.json();
        const jsonTasas = await resTasas.json();

        if (jsonVehiculos.success && Array.isArray(jsonVehiculos.data)) {
          setVehiculos(jsonVehiculos.data);
          if (jsonVehiculos.data.length > 0) {
            setFormData((prev) => ({ ...prev, vehiculoId: jsonVehiculos.data[0].id }));
          }
        }

        if (jsonPlantillas.success && Array.isArray(jsonPlantillas.data) && jsonPlantillas.data.length > 0) {
          setPlantillasServicio(jsonPlantillas.data);
          setFormData((prev) => ({ ...prev, tipoServicio: jsonPlantillas.data[0].valor }));
        }

        if (jsonTasas.success && jsonTasas.data) {
          setTasasData(jsonTasas.data);
          const defaultTasa = jsonTasas.data.usdBcv || 888.12;
          setFormData((prev) => ({ ...prev, tasaCambio: String(defaultTasa) }));
        }
      } catch (err: any) {
        console.error("Error al cargar datos maestros:", err);
        setErrorMessage("No se pudieron cargar los datos maestros de vehiculos o plantillas.");
      }
    }

    loadData();
  }, []);

  // Manejo de conversion bidireccional USD <-> Bs
  const handleCostoUsdChange = (val: string) => {
    const tasa = parseFloat(formData.tasaCambio);
    const usdNum = parseFloat(val);
    if (!isNaN(usdNum) && !isNaN(tasa) && tasa > 0) {
      setFormData((prev) => ({
        ...prev,
        costoManoObra: val,
        costoManoObraBs: (usdNum * tasa).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        costoManoObra: val,
        costoManoObraBs: val === "" ? "" : prev.costoManoObraBs,
      }));
    }
  };

  const handleCostoBsChange = (val: string) => {
    const tasa = parseFloat(formData.tasaCambio);
    const bsNum = parseFloat(val);
    if (!isNaN(bsNum) && !isNaN(tasa) && tasa > 0) {
      setFormData((prev) => ({
        ...prev,
        costoManoObraBs: val,
        costoManoObra: (bsNum / tasa).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        costoManoObraBs: val,
        costoManoObra: val === "" ? "" : prev.costoManoObra,
      }));
    }
  };

  const handleSeleccionarTipoTasa = (tipo: "BCV" | "USDT" | "MANUAL") => {
    setTipoTasa(tipo);
    let nuevaTasa = parseFloat(formData.tasaCambio) || 1;
    if (tipo === "BCV" && tasasData?.usdBcv) {
      nuevaTasa = tasasData.usdBcv;
    } else if (tipo === "USDT" && tasasData?.usdt) {
      nuevaTasa = tasasData.usdt;
    }

    setFormData((prev) => {
      const usdNum = parseFloat(prev.costoManoObra);
      const bsCalculado = !isNaN(usdNum) && nuevaTasa > 0 ? (usdNum * nuevaTasa).toFixed(2) : prev.costoManoObraBs;
      return {
        ...prev,
        tasaCambio: String(nuevaTasa),
        costoManoObraBs: bsCalculado,
      };
    });
  };

  const handleTasaManualChange = (val: string) => {
    setTipoTasa("MANUAL");
    const nuevaTasa = parseFloat(val);
    setFormData((prev) => {
      const usdNum = parseFloat(prev.costoManoObra);
      const bsCalculado = !isNaN(usdNum) && !isNaN(nuevaTasa) && nuevaTasa > 0 ? (usdNum * nuevaTasa).toFixed(2) : prev.costoManoObraBs;
      return {
        ...prev,
        tasaCambio: val,
        costoManoObraBs: bsCalculado,
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const { name } = target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCrearNuevoServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicioInput.trim()) return;

    setIsSavingServicio(true);
    try {
      const res = await fetch("/api/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: "TIPO_SERVICIO",
          valor: nuevoServicioInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el tipo de servicio.");
      }

      setPlantillasServicio((prev) => [...prev, data.data]);
      setFormData((prev) => ({ ...prev, tipoServicio: data.data.valor }));
      setNuevoServicioInput("");
      setShowAddServicioModal(false);
    } catch (err: any) {
      alert(err.message || "Error al registrar el tipo de servicio.");
    } finally {
      setIsSavingServicio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.vehiculoId) {
      setErrorMessage("Debe seleccionar un vehiculo para la orden de trabajo.");
      setIsLoading(false);
      return;
    }

    if (!formData.tipoServicio.trim()) {
      setErrorMessage("Debe seleccionar el tipo de servicio tecnico a ejecutar.");
      setIsLoading(false);
      return;
    }

    const descripcionCompleta = formData.detallesAdicionales.trim()
      ? `${formData.tipoServicio.trim()} — ${formData.detallesAdicionales.trim()}`
      : formData.tipoServicio.trim();

    try {
      const payload = {
        vehiculoId: formData.vehiculoId,
        fechaProgramada: formData.fechaProgramada,
        descripcionServicio: descripcionCompleta,
        estado: formData.estado,
        kilometraje: formData.kilometraje ? Number(formData.kilometraje) : null,
        horasHombre: formData.horasHombre ? Number(formData.horasHombre) : null,
        costoManoObra: formData.costoManoObra ? Number(formData.costoManoObra) : null,
        costoManoObraBs: formData.costoManoObraBs ? Number(formData.costoManoObraBs) : null,
        tasaCambio: formData.tasaCambio ? Number(formData.tasaCambio) : null,
        esGarantia: Boolean(formData.esGarantia),
      };

      const response = await fetch("/api/mantenimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al programar orden de mantenimiento.");
      }

      setSuccessMessage("Orden de mantenimiento programada exitosamente.");

      setTimeout(() => {
        router.push("/mantenimientos");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Error al conectar con el servidor de base de datos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Programar Orden de Mantenimiento"
        subtitle="Generacion de ficha tecnica para servicio preventivo, correctivo o garantia"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/mantenimientos"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a ordenes de mantenimiento</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Error al programar servicio</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operacion exitosa</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
              Ficha Operativa de la Orden de Trabajo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina la unidad intervenida, fecha prevista, tipo de servicio y alcance tecnico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehiculo */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="vehiculoId"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Unidad Vehicular / Cliente Titular <span className="text-rose-600">*</span>
                </label>
                {vehiculos.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-center justify-between">
                    <span>No hay vehiculos registrados en la base de datos aun.</span>
                    <Link
                      href="/vehiculos/nuevo"
                      className="underline font-semibold hover:text-amber-950"
                    >
                      Registrar Vehiculo Primero
                    </Link>
                  </div>
                ) : (
                  <select
                    id="vehiculoId"
                    name="vehiculoId"
                    required
                    value={formData.vehiculoId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 font-medium"
                  >
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.cliente?.nombre ? `[${v.cliente.nombre}] ` : ""}{v.tipo ? `(${v.tipo}) ` : ""}{v.marca} {v.modelo} ({v.anio})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-400">
                  Seleccione la unidad identificada por su cliente titular, tipo y especificaciones tecnicas.
                </p>
              </div>

              {/* Tipo de Servicio Tecnico (Menu Desplegable de Plantillas) */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="tipoServicio"
                    className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tipo de Servicio Tecnico a Ejecutar <span className="text-rose-600">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddServicioModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>+ Otro tipo de servicio</span>
                  </button>
                </div>

                <select
                  id="tipoServicio"
                  name="tipoServicio"
                  required
                  value={formData.tipoServicio}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                >
                  {plantillasServicio.map((p) => (
                    <option key={p.id} value={p.valor}>
                      {p.valor}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Seleccione el servicio predefinido de la plantilla oficial. Quedara seleccionado de forma fija para esta orden.
                </p>
              </div>

              {/* Detalles u Observaciones Adicionales */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="detallesAdicionales"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Detalle / Observaciones Tecnicas Especificas{" "}
                  <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="detallesAdicionales"
                  name="detallesAdicionales"
                  rows={3}
                  value={formData.detallesAdicionales}
                  onChange={handleChange}
                  placeholder="Ej. Sustituir pastillas de freno delanteras, calibrar inyectores 2 y 4, verificar nivel de refrigerante..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Fecha Programada */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fechaProgramada"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Fecha Programada <span className="text-rose-600">*</span>
                </label>
                <input
                  id="fechaProgramada"
                  name="fechaProgramada"
                  type="date"
                  required
                  value={formData.fechaProgramada}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Estado Inicial */}
              <div className="space-y-1.5">
                <label
                  htmlFor="estado"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Estado Inicial de la Orden <span className="text-rose-600">*</span>
                </label>
                <select
                  id="estado"
                  name="estado"
                  required
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="PENDIENTE">PENDIENTE (Programado sin iniciar)</option>
                  <option value="EN_PROCESO">EN_PROCESO (En taller)</option>
                  <option value="COMPLETADO">COMPLETADO (Inspeccion finalizada)</option>
                </select>
              </div>

              {/* Kilometraje del Vehiculo */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="kilometraje"
                  className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kilometraje al Ingresar (km)</span>
                  <span className="text-slate-400 font-normal">(Recomendado)</span>
                </label>
                <input
                  id="kilometraje"
                  name="kilometraje"
                  type="number"
                  min={0}
                  step={1}
                  value={formData.kilometraje}
                  onChange={handleChange}
                  placeholder="Ej. 65000"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
                <p className="text-[11px] text-slate-400">
                  Lectura del odometro del vehiculo para trazabilidad del intervalo de servicio.
                </p>
              </div>

              {/* Apartado Financiero y de Garantia (Opcional) */}
              <div className="md:col-span-2 p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                      <span>Parametros Financieros y Mano de Obra (Opcional)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Registro de costos de taller, tiempo empleado y condicion de garantia
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Selector y visualizador de tasa de cambio */}
                  <div className="p-3 bg-white rounded-md border border-slate-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 font-mono">
                        <Calculator className="w-3.5 h-3.5 text-slate-500" />
                        <span>Conversion de Divisa y Tasa Referencial</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {tasasData?.usdBcv && (
                          <button
                            type="button"
                            onClick={() => handleSeleccionarTipoTasa("BCV")}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                              tipoTasa === "BCV"
                                ? "bg-slate-900 text-white font-semibold shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            BCV: {tasasData.usdBcv.toFixed(2)} Bs.
                          </button>
                        )}
                        {tasasData?.usdt && (
                          <button
                            type="button"
                            onClick={() => handleSeleccionarTipoTasa("USDT")}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                              tipoTasa === "USDT"
                                ? "bg-slate-900 text-white font-semibold shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            USDT: {tasasData.usdt.toFixed(2)} Bs.
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSeleccionarTipoTasa("MANUAL")}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            tipoTasa === "MANUAL"
                              ? "bg-slate-900 text-white font-semibold shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      {/* Campo USD */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>Monto en Dolares ($ USD)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={formData.costoManoObra}
                            onChange={(e) => handleCostoUsdChange(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
                          />
                        </div>
                      </div>

                      {/* Campo Tasa */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                            <span>Tasa (Bs./$)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tipoTasa === "BCV" ? "Oficial" : tipoTasa === "USDT" ? "Mercado" : "Ajustable"}
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0.01}
                          value={formData.tasaCambio}
                          onChange={(e) => handleTasaManualChange(e.target.value)}
                          placeholder="888.12"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                      </div>

                      {/* Campo Bs */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1">
                          <span className="font-semibold text-sky-700 text-[10px]">Bs.</span>
                          <span>Monto en Bolivares (Bs.)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">Bs.</span>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={formData.costoManoObraBs}
                            onChange={(e) => handleCostoBsChange(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Horas Hombre */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="horasHombre"
                        className="block text-xs font-medium text-slate-700 flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Horas Hombre Invertidas (h)</span>
                      </label>
                      <input
                        id="horasHombre"
                        name="horasHombre"
                        type="number"
                        step="0.5"
                        min={0}
                        value={formData.horasHombre}
                        onChange={handleChange}
                        placeholder="Ej. 3.5"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                  </div>

                  {/* Checkbox de Trabajo por Garantia */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="esGarantia"
                        checked={formData.esGarantia}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Trabajo amparado por garantia de servicio anterior</span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Marque esta casilla si la intervencion corresponde a una correccion o ajuste bajo garantia sin costo facturable de mano de obra al cliente.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/mantenimientos"
                className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? "Programando..." : "Registrar Orden"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal rapido para incorporar otro tipo de servicio al vuelo */}
      {showAddServicioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Agregar Nuevo Tipo de Servicio
              </h3>
              <p className="text-xs text-slate-500">
                Este servicio se guardara en la plantilla de configuracion y quedara seleccionado de inmediato.
              </p>

              <form onSubmit={handleCrearNuevoServicio} className="space-y-4 pt-1">
                <input
                  type="text"
                  required
                  autoFocus
                  value={nuevoServicioInput}
                  onChange={(e) => setNuevoServicioInput(e.target.value)}
                  placeholder="Ej. Rectificacion de Discos, Escaneo ABS..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddServicioModal(false);
                      setNuevoServicioInput("");
                    }}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingServicio || !nuevoServicioInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSavingServicio ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Guardar y Seleccionar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
