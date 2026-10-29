"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, UserCheck, Plus, Sparkles, Loader2 } from "lucide-react";
import { Cliente } from "@/types";

interface OpcionCatalogo {
  id: string;
  valor: string;
}

export default function NuevoVehiculoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    clienteId: "",
    tipo: "Carro",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [marcas, setMarcas] = useState<OpcionCatalogo[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<OpcionCatalogo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal para agregar nueva marca al vuelo
  const [showAddMarcaModal, setShowAddMarcaModal] = useState(false);
  const [nuevaMarcaInput, setNuevaMarcaInput] = useState("");
  const [isSavingMarca, setIsSavingMarca] = useState(false);

  // Modelos de la marca seleccionada
  const [modelosSugeridos, setModelosSugeridos] = useState<OpcionCatalogo[]>([]);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);
  const [showAddModeloModal, setShowAddModeloModal] = useState(false);
  const [nuevoModeloInput, setNuevoModeloInput] = useState("");
  const [isSavingModelo, setIsSavingModelo] = useState(false);

  // Cargar lista de clientes, marcas y tipos
  useEffect(() => {
    async function loadData() {
      try {
        const [resClientes, resMarcas, resTipos] = await Promise.all([
          fetch("/api/clientes"),
          fetch("/api/catalogos?categoria=MARCA_VEHICULO"),
          fetch("/api/catalogos?categoria=TIPO_VEHICULO"),
        ]);

        const jsonClientes = await resClientes.json();
        const jsonMarcas = await resMarcas.json();
        const jsonTipos = await resTipos.json();

        if (jsonClientes.success && Array.isArray(jsonClientes.data)) {
          setClientes(jsonClientes.data);
          if (jsonClientes.data.length > 0) {
            setFormData((prev) => ({ ...prev, clienteId: jsonClientes.data[0].id }));
          }
        }

        if (jsonMarcas.success && Array.isArray(jsonMarcas.data)) {
          setMarcas(jsonMarcas.data);
          if (jsonMarcas.data.length > 0) {
            setFormData((prev) => ({ ...prev, marca: jsonMarcas.data[0].valor }));
          }
        }

        if (jsonTipos.success && Array.isArray(jsonTipos.data) && jsonTipos.data.length > 0) {
          setTiposVehiculo(jsonTipos.data);
          setFormData((prev) => ({ ...prev, tipo: jsonTipos.data[0].valor }));
        } else {
          setTiposVehiculo([
            { id: "t1", valor: "Carro" },
            { id: "t2", valor: "Moto" },
            { id: "t3", valor: "Camioneta" },
          ]);
        }
      } catch (err: any) {
        console.error("Error al cargar datos maestros:", err);
        setErrorMessage("No se pudieron cargar los datos maestros de clientes o catalogos.");
      }
    }

    loadData();
  }, []);

  // Cargar dinamicamente los modelos cuando cambia la marca seleccionada
  useEffect(() => {
    if (!formData.marca) return;

    async function loadModelosDeMarca() {
      setIsLoadingModelos(true);
      try {
        const res = await fetch(`/api/catalogos?marca=${encodeURIComponent(formData.marca)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setModelosSugeridos(json.data);
        } else {
          setModelosSugeridos([]);
        }
      } catch (err) {
        console.error("Error al cargar modelos de la marca:", err);
      } finally {
        setIsLoadingModelos(false);
      }
    }

    loadModelosDeMarca();
  }, [formData.marca]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "anio" ? Number(value) : value,
    }));
  };

  const handleCrearNuevaMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaMarcaInput.trim()) return;

    setIsSavingMarca(true);
    try {
      const res = await fetch("/api/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: "MARCA_VEHICULO",
          valor: nuevaMarcaInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar la marca.");
      }

      setMarcas((prev) => [...prev, data.data]);
      setFormData((prev) => ({ ...prev, marca: data.data.valor }));
      setNuevaMarcaInput("");
      setShowAddMarcaModal(false);
    } catch (err: any) {
      alert(err.message || "Error al registrar la marca.");
    } finally {
      setIsSavingMarca(false);
    }
  };

  const handleCrearNuevoModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoModeloInput.trim() || !formData.marca) return;

    setIsSavingModelo(true);
    try {
      const res = await fetch("/api/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: formData.marca,
          valor: nuevoModeloInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el modelo.");
      }

      setModelosSugeridos((prev) => [...prev, data.data]);
      setFormData((prev) => ({ ...prev, modelo: data.data.valor }));
      setNuevoModeloInput("");
      setShowAddModeloModal(false);
    } catch (err: any) {
      alert(err.message || "Error al registrar el modelo.");
    } finally {
      setIsSavingModelo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.clienteId) {
      setErrorMessage("Debe seleccionar un cliente titular para vincular el vehiculo.");
      setIsLoading(false);
      return;
    }

    if (!formData.marca.trim() || !formData.modelo.trim()) {
      setErrorMessage("La marca y modelo del vehiculo son requeridos.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al registrar el vehiculo.");
      }

      setSuccessMessage("Vehiculo registrado y vinculado exitosamente al cliente.");

      setTimeout(() => {
        router.push("/vehiculos");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        err.message || "No fue posible conectar con el servicio de base de datos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Registro de Vehiculo en Flota"
        subtitle="Alta de unidad vehicular y vinculacion directa al cliente"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/vehiculos"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al padron de vehiculos</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Error al registrar unidad</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registro exitoso</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Datos de la Unidad y Titularidad
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vincule el vehiculo al cliente propietario y seleccione su marca de la plantilla oficial
              </p>
            </div>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente Propietario */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="clienteId"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Cliente Titular Asociado <span className="text-rose-600">*</span>
                </label>
                {clientes.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-center justify-between">
                    <span>No hay clientes registrados en la base de datos aun.</span>
                    <Link
                      href="/clientes/nuevo"
                      className="underline font-semibold hover:text-amber-950"
                    >
                      Registrar Cliente Primero
                    </Link>
                  </div>
                ) : (
                  <select
                    id="clienteId"
                    name="clienteId"
                    required
                    value={formData.clienteId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 font-medium"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                        {c.documentoIdentidad ? ` (Doc: ${c.documentoIdentidad})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-400">
                  El vehiculo quedara vinculado a este cliente en el sistema para diferenciarlo en flotas y reportes.
                </p>
              </div>

              {/* Tag / Tipo de Vehiculo */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="tipo"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Tipo de Unidad (Tag de Clasificacion) <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {tiposVehiculo.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, tipo: t.valor }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        formData.tipo === t.valor
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {t.valor}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Permite identificar de un vistazo si se trata de Carro, Moto, Camioneta u otro segmento.
                </p>
              </div>

              {/* Marca Automotriz (Menu Desplegable con plantilla de marcas) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="marca"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Marca Automotriz <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddMarcaModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>+ Otra marca</span>
                  </button>
                </div>

                <select
                  id="marca"
                  name="marca"
                  required
                  value={formData.marca}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 font-medium"
                >
                  {marcas.map((m) => (
                    <option key={m.id} value={m.valor}>
                      {m.valor}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Seleccione entre las marcas configuradas o agregue una nueva con el boton superior.
                </p>
              </div>

              {/* Modelo / Version */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="modelo"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Modelo / Version <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddModeloModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>+ Otro modelo</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="modelo"
                    name="modelo"
                    type="text"
                    required
                    list="lista-modelos-sugeridos"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder={
                      modelosSugeridos.length > 0
                        ? `Ej. ${modelosSugeridos.slice(0, 3).map((m) => m.valor).join(", ")}...`
                        : "Ej. Aveo, Optra, Hilux, Corolla, Fiesta..."
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  />
                  {isLoadingModelos && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Datalist nativo para autocompletar segun la marca */}
                <datalist id="lista-modelos-sugeridos">
                  {modelosSugeridos.map((m) => (
                    <option key={m.id} value={m.valor} />
                  ))}
                </datalist>

                {/* Chips de modelos mas comunes en Venezuela para la marca seleccionada */}
                {modelosSugeridos.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] text-slate-400 font-mono">
                      Sugerencias de {formData.marca}:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {modelosSugeridos.slice(0, 8).map((m) => {
                        const isSelected = formData.modelo === m.valor;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, modelo: m.valor }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {m.valor}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Año de Fabricacion */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="anio"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Año de Fabricacion <span className="text-rose-600">*</span>
                </label>
                <input
                  id="anio"
                  name="anio"
                  type="number"
                  required
                  min={1970}
                  max={2035}
                  value={formData.anio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/vehiculos"
                className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isLoading || clientes.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? "Guardando..." : "Guardar Vehiculo"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal rapido para incorporar otra marca al vuelo */}
      {showAddMarcaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Agregar Nueva Marca Automotriz
              </h3>
              <p className="text-xs text-slate-500">
                Esta marca se guardara en la plantilla de configuracion y quedara seleccionada de inmediato.
              </p>

              <form onSubmit={handleCrearNuevaMarca} className="space-y-4 pt-1">
                <input
                  type="text"
                  required
                  autoFocus
                  value={nuevaMarcaInput}
                  onChange={(e) => setNuevaMarcaInput(e.target.value)}
                  placeholder="Ej. BYD, Foton, MG, Great Wall..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMarcaModal(false);
                      setNuevaMarcaInput("");
                    }}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMarca || !nuevaMarcaInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSavingMarca ? (
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

      {/* Modal rapido para incorporar otro modelo a la marca seleccionada al vuelo */}
      {showAddModeloModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Agregar Nuevo Modelo a {formData.marca}
              </h3>
              <p className="text-xs text-slate-500">
                Este modelo quedará registrado en la plantilla de {formData.marca} y seleccionado para este vehículo.
              </p>

              <form onSubmit={handleCrearNuevoModelo} className="space-y-4 pt-1">
                <input
                  type="text"
                  required
                  autoFocus
                  value={nuevoModeloInput}
                  onChange={(e) => setNuevoModeloInput(e.target.value)}
                  placeholder="Ej. Aveo LT, Optra Design, Hilux Kavak..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModeloModal(false);
                      setNuevoModeloInput("");
                    }}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingModelo || !nuevoModeloInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSavingModelo ? (
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
