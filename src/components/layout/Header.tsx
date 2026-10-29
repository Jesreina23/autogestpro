"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  User,
  Menu,
  AlertCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Settings,
  Palette,
  Lock,
  LogOut,
  Users,
  Check,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { RolUsuario } from "@/types";

const ROLES_INFO: Record<RolUsuario, { label: string; badgeClass: string }> = {
  ADMINISTRADOR: {
    label: "Administrador",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  SUPERVISOR: {
    label: "Supervisor de Taller",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  MECANICO_OPERADOR: {
    label: "Mecánico / Operador",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CLIENTE: {
    label: "Portal Cliente",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

interface NotificacionItem {
  id: string;
  mantenimientoId: string;
  tipo: "URGENTE" | "COSTOS" | "GARANTIA" | "PROCESO";
  titulo: string;
  mensaje: string;
  vehiculo: string;
  cliente: string;
  fechaProgramada: string;
  link: string;
}

export function Header({
  title = "Panel Principal",
  subtitle = "Monitoreo y gestion operativa",
}: HeaderProps) {
  const { toggleMobileSidebar } = useSidebar();
  const {
    currentUser,
    usuarios,
    switchUser,
    isLocked,
    lockSession,
    unlockSession,
    logout,
  } = useUser();

  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotificaciones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notificaciones");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotificaciones(json.data);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Actualizar notificaciones periodicamente cada 2 minutos
    const interval = setInterval(fetchNotificaciones, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar los menus desplegables al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const tieneUrgentes = notificaciones.some((n) => n.tipo === "URGENTE");

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 select-none shadow-xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Boton Hamburguesa exclusivo para pantallas moviles / tablets (< 768px) */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Abrir menu de navegacion"
          className="md:hidden p-2 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          <Menu className="w-5 h-5 shrink-0" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Barra de busqueda global rapida */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa, cliente o ID..."
            className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-normal transition-all"
          />
        </div>

        {/* Separador vertical */}
        <div className="hidden sm:block h-5 w-px bg-slate-200" />

        {/* Campanita de Notificaciones Activa con Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpenNotifications((prev) => !prev)}
            aria-label="Notificaciones operativas"
            title={
              notificaciones.length > 0
                ? `${notificaciones.length} alertas operativas pendientes`
                : "Sin alertas pendientes"
            }
            className={`relative p-2 rounded-md transition-all ${
              isOpenNotifications
                ? "bg-slate-100 text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-4 h-4" />

            {/* Contador / Indicador de Alertas */}
            {notificaciones.length > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold font-mono text-white flex items-center justify-center shadow-xs ${
                  tieneUrgentes ? "bg-rose-600 animate-pulse" : "bg-amber-600"
                }`}
              >
                {notificaciones.length > 9 ? "9+" : notificaciones.length}
              </span>
            )}
          </button>

          {/* Panel Desplegable de Notificaciones */}
          {isOpenNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Cabecera del Panel */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                    Alertas Operativas
                  </h3>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      notificaciones.length > 0
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {notificaciones.length}{" "}
                    {notificaciones.length === 1 ? "activa" : "activas"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={fetchNotificaciones}
                  disabled={isLoading}
                  title="Actualizar alertas"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-slate-600" : ""}`}
                  />
                </button>
              </div>

              {/* Lista de Alertas */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {isLoading && notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                    <p>Consultando alertas en tiempo real...</p>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800">
                      Taller al día
                    </p>
                    <p className="text-[11px] text-slate-500">
                      No hay órdenes vencidas, pendientes de costeo ni alertas de garantía activas.
                    </p>
                  </div>
                ) : (
                  notificaciones.map((notif) => {
                    const isUrgente = notif.tipo === "URGENTE";
                    const isCostos = notif.tipo === "COSTOS";
                    const isGarantia = notif.tipo === "GARANTIA";

                    return (
                      <Link
                        key={notif.id}
                        href={notif.link}
                        onClick={() => setIsOpenNotifications(false)}
                        className="p-3 sm:p-3.5 block hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              isUrgente
                                ? "bg-rose-100 text-rose-700"
                                : isCostos
                                ? "bg-amber-100 text-amber-700"
                                : isGarantia
                                ? "bg-purple-100 text-purple-700"
                                : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {isUrgente ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : isCostos ? (
                              <DollarSign className="w-4 h-4" />
                            ) : isGarantia ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-900 group-hover:text-slate-950">
                                {notif.titulo}
                              </p>
                              <span className="text-[10px] font-mono text-slate-400">
                                {isUrgente ? "Urgente" : isCostos ? "Financiero" : "Técnico"}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {notif.mensaje}
                            </p>

                            <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-400 font-mono truncate">
                              <span className="truncate">{notif.vehiculo}</span>
                              <span>•</span>
                              <span className="truncate">{notif.cliente}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Pie del Panel */}
              <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-center">
                <Link
                  href="/mantenimientos"
                  onClick={() => setIsOpenNotifications(false)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 font-semibold transition-colors"
                >
                  <span>Ver todas las órdenes de trabajo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Perfil del Operador y Menu de Sesion Activa */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpenUserMenu((prev) => !prev)}
            aria-label="Menu de usuario y sesion"
            className={`flex items-center gap-2 pl-1 sm:pl-2 py-1 pr-2 rounded-lg transition-all ${
              isOpenUserMenu
                ? "bg-slate-100 text-slate-900 shadow-2xs"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-bold font-mono">
              {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentUser?.nombre || "Ing. Supervisor"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                {currentUser?.rol ? ROLES_INFO[currentUser.rol]?.label : "Operaciones Flota"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${
                isOpenUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Panel Desplegable de Sesion y Perfil */}
          {isOpenUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Informacion del Usuario Activo */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold font-mono shrink-0 shadow-xs">
                    {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.nombre || "Ing. Supervisor"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      @{currentUser?.usuario || "supervisor"}
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          currentUser?.rol
                            ? ROLES_INFO[currentUser.rol]?.badgeClass
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {currentUser?.rol
                          ? ROLES_INFO[currentUser.rol]?.label
                          : "Supervisor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atajos Rapidos del Sistema */}
              <div className="p-2 space-y-0.5">
                {currentUser?.rol !== "CLIENTE" && (
                  <Link
                    href="/configuracion"
                    onClick={() => setIsOpenUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Configuración y Gestión de Roles</span>
                  </Link>
                )}

                <Link
                  href="/configuracion"
                  onClick={() => setIsOpenUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Palette className="w-4 h-4 text-slate-500" />
                  <span>Apariencia y Paletas de Color</span>
                </Link>
              </div>

              {/* Selector Rapido de Rol / Usuario (Exclusivo Personal del Taller) */}
              {currentUser?.rol !== "CLIENTE" && (
                <div className="border-t border-slate-100 p-3 bg-slate-50/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center justify-between">
                    <span>Cambiar Operador Activo</span>
                    <Users className="w-3 h-3 text-slate-400" />
                  </p>

                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {usuarios
                      .filter((u) => u.rol !== "CLIENTE")
                      .map((u) => {
                        const isSelected = currentUser?.id === u.id;
                        const roleInfo = ROLES_INFO[u.rol] || {
                          label: u.rol,
                          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                        };

                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              switchUser(u.id);
                              setIsOpenUserMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-colors ${
                              isSelected
                                ? "bg-slate-900 text-white shadow-2xs font-medium"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="truncate pr-2 min-w-0">
                              <p className="truncate font-medium">{u.nombre}</p>
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                {roleInfo.label}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Footer con Cerrar Sesión / Bloqueo */}
              <div className="p-2 border-t border-slate-100 bg-slate-50 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    lockSession();
                    setIsOpenUserMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bloquear Sesión</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpenUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay de Bloqueo de Sesion */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                Sesión Operativa Bloqueada
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                La consola de flota se encuentra pausada para proteger la integridad del taller.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-left">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Operador en Pausa
              </p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                {currentUser?.nombre}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                @{currentUser?.usuario || "supervisor"}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={unlockSession}
                className="w-full py-2.5 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Desbloquear y Reanudar Trabajo</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2 rounded-md border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

