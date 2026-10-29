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
  User,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function NuevoClientePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: "",
    documentoIdentidad: "",
    telefono: "",
    correo: "",
  });

  // Opciones de creacion automatica de credenciales de usuario
  const [crearUsuario, setCrearUsuario] = useState(true);
  const [usuarioSugerido, setUsuarioSugerido] = useState("");
  const [passwordSugerida, setPasswordSugerida] = useState("");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [usuarioPersonalizado, setUsuarioPersonalizado] = useState("");
  const [passwordPersonalizada, setPasswordPersonalizada] = useState("");
  const [isLoadingSugerencia, setIsLoadingSugerencia] = useState(false);

  // Modal de credenciales generadas tras registro
  const [modalCredenciales, setModalCredenciales] = useState<{
    clienteNombre: string;
    usuario: string;
    passwordInicial: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calcular en tiempo real el usuario sugerido segun el nombre y cedula
  useEffect(() => {
    if (!formData.nombre.trim()) {
      setUsuarioSugerido("");
      setPasswordSugerida("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSugerencia(true);
      try {
        const query = new URLSearchParams({
          nombre: formData.nombre.trim(),
          documento: formData.documentoIdentidad.trim(),
        });
        const res = await fetch(`/api/usuarios/generar-username?${query.toString()}`);
        const json = await res.json();
        if (json.success && json.username) {
          setUsuarioSugerido(json.username);
          setPasswordSugerida(json.passwordSugerida);
          if (!isCustomizing) {
            setUsuarioPersonalizado(json.username);
            setPasswordPersonalizada(json.passwordSugerida);
          }
        }
      } catch (err) {
        console.error("Error al sugerir username:", err);
      } finally {
        setIsLoadingSugerencia(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.nombre, formData.documentoIdentidad, isCustomizing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopiarCredenciales = () => {
    if (!modalCredenciales) return;
    const texto = `Hola ${modalCredenciales.clienteNombre}, tus credenciales de acceso para el portal de AutoGest Pro son:\nUsuario: @${modalCredenciales.usuario}\nClave: ${modalCredenciales.passwordInicial}`;
    navigator.clipboard.writeText(texto);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validacion de campos requeridos
    if (!formData.nombre.trim()) {
      setErrorMessage("El nombre o razon social del cliente es obligatorio.");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        ...formData,
        crearUsuario,
      };

      if (crearUsuario) {
        payload.usuarioPersonalizado = isCustomizing
          ? usuarioPersonalizado
          : usuarioSugerido;
        payload.passwordPersonalizada = isCustomizing
          ? passwordPersonalizada
          : passwordSugerida;
      }

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ocurrio un error al registrar el cliente.");
      }

      setSuccessMessage("Cliente registrado correctamente en el sistema.");

      // Si se creo usuario de acceso, mostrar modal con las credenciales
      if (result.usuarioCreado) {
        setModalCredenciales({
          clienteNombre: result.data.nombre,
          usuario: result.usuarioCreado.usuario,
          passwordInicial: result.usuarioCreado.passwordInicial,
        });
      } else {
        setTimeout(() => {
          router.push("/clientes");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Error al conectar con el servicio de base de datos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Registro de Nuevo Cliente"
        subtitle="Incorporacion de titular comercial o institucional al padron"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Enlace de retroceso */}
        <div className="mb-6">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al directorio de clientes</span>
          </Link>
        </div>

        {/* Mensajes de retroalimentacion */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Error al procesar solicitud</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && !modalCredenciales && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operacion exitosa</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Formulario Corporativo */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
              Datos Generales del Cliente
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete los campos requeridos para dar de alta al titular de flota
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Razon Social / Nombre */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="nombre"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Razon Social o Nombre Completo{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Carlos Rodríguez"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Documento de Identidad / RIF / NIT / DNI */}
              <div className="space-y-1.5">
                <label
                  htmlFor="documentoIdentidad"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Documento de Identidad / Identificador Fiscal{" "}
                  <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="documentoIdentidad"
                  name="documentoIdentidad"
                  type="text"
                  value={formData.documentoIdentidad}
                  onChange={handleChange}
                  placeholder="Ej. V-28123456 o J-30491823-1"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
                <p className="text-[11px] text-slate-400">
                  La clave inicial se generará automáticamente a partir de este documento.
                </p>
              </div>

              {/* Telefono */}
              <div className="space-y-1.5">
                <label
                  htmlFor="telefono"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Telefono de Contacto
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. +58 412 1234567"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Correo Electronico de Contacto */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="correo"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Correo Electronico de Contacto{" "}
                  <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Ej. cliente@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
            </div>

            {/* SECCION: Credenciales de Acceso Automaticas al Portal */}
            <div className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                      <span>Portal de Clientes - Usuario y Acceso Automático</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Crea automáticamente las credenciales de consulta para que el cliente revise sus unidades y servicios.
                    </p>
                  </div>
                </div>

                {/* Checkbox Toggle */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={crearUsuario}
                    onChange={(e) => setCrearUsuario(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Habilitar</span>
                </label>
              </div>

              {crearUsuario && (
                <div className="pt-3 border-t border-slate-200/80 space-y-3">
                  {!formData.nombre.trim() ? (
                    <div className="p-3 bg-white rounded border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Escriba el nombre completo del cliente para previsualizar el usuario generado.</span>
                    </div>
                  ) : (
                    <div className="bg-white p-3.5 rounded-md border border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Usuario Generado */}
                        <div>
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                            Usuario Autogenerado
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              @{isCustomizing ? usuarioPersonalizado : usuarioSugerido || "calculando..."}
                            </span>
                            {isLoadingSugerencia ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3" />
                                Disponible
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Clave Generada */}
                        <div>
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                            Contraseña Inicial
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {isCustomizing ? passwordPersonalizada : passwordSugerida || "AutoGest2026*"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formData.documentoIdentidad ? "(Basada en cédula)" : "(Predeterminada)"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Boton para personalizar manualmente si se desea */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setIsCustomizing((prev) => !prev)}
                          className="text-slate-600 hover:text-slate-900 underline font-medium"
                        >
                          {isCustomizing ? "Restablecer a sugerencia automatica" : "+ Personalizar usuario o clave manualmente"}
                        </button>
                      </div>

                      {/* Campos editables si el usuario decide personalizar */}
                      {isCustomizing && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Usuario personalizado
                            </label>
                            <input
                              type="text"
                              value={usuarioPersonalizado}
                              onChange={(e) =>
                                setUsuarioPersonalizado(
                                  e.target.value.toLowerCase().replace(/\s+/g, '_')
                                )
                              }
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Contraseña personalizada
                            </label>
                            <input
                              type="text"
                              value={passwordPersonalizada}
                              onChange={(e) => setPasswordPersonalizada(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Barra de Acciones del Formulario */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/clientes"
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
                <span>{isLoading ? "Guardando..." : "Guardar Cliente"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de confirmacion con las credenciales creadas para copiar/compartir */}
      {modalCredenciales && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                Cliente y Cuenta Creados con Éxito
              </h3>
              <p className="text-xs text-slate-500">
                Se ha generado el acceso al portal para {modalCredenciales.clienteNombre}
              </p>
            </div>

            {/* Tarjeta de Credenciales */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Nombre de Usuario:</span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  @{modalCredenciales.usuario}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Contraseña Asignada:</span>
                <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {modalCredenciales.passwordInicial}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Rol:</span>
                <span className="text-[10px] font-semibold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Portal Cliente
                </span>
              </div>
            </div>

            {/* Botones de accion */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopiarCredenciales}
                className="w-full py-2 px-3 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copiar Credenciales (WhatsApp / Mensaje)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalCredenciales(null);
                  router.push("/clientes");
                  router.refresh();
                }}
                className="w-full py-2.5 px-3 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Finalizar e Ir al Directorio de Clientes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

