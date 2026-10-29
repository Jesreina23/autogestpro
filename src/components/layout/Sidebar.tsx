"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  FileText,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { RatesWidget } from "./RatesWidget";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Panel de Control",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    name: "Vehiculos",
    href: "/vehiculos",
    icon: Car,
  },
  {
    name: "Mantenimientos",
    href: "/mantenimientos",
    icon: Wrench,
  },
  {
    name: "Reportes Tecnicos",
    href: "/reportes",
    icon: FileText,
  },
  {
    name: "Configuracion",
    href: "/configuracion",
    icon: Settings,
  },
];

const clientNavigationItems: NavigationItem[] = [
  {
    name: "Mis Vehículos",
    href: "/vehiculos",
    icon: Car,
  },
  {
    name: "Mis Mantenimientos",
    href: "/mantenimientos",
    icon: Wrench,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { currentUser } = useUser();

  const isClient = currentUser?.rol === "CLIENTE";
  const currentNavItems = isClient ? clientNavigationItems : navigationItems;

  return (
    <>
      {/* Sidebar de Escritorio (visible a partir de md: 768px) */}
      <aside
        className={cn(
          "hidden md:flex sidebar-surface border-r border-slate-800 flex-col h-screen shrink-0 select-none transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Cabecera del Sidebar con boton de tres rayitas para plegar/desplegar */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-slate-800 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded sidebar-brand-badge border flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-sm font-semibold tracking-tight text-white uppercase truncate">
                  AutoGest Pro
                </span>
                <span className="text-[10px] sidebar-brand-subtitle font-mono tracking-wider truncate">
                  {isClient ? "PORTAL DE CLIENTE" : "INGENIERIA & FLOTA"}
                </span>
              </div>
            </div>
          )}

          {/* Boton de tres rayitas (Hamburguesa) para plegar o desplegar */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? "Desplegar menu lateral" : "Plegar menu lateral"}
            aria-label={isCollapsed ? "Desplegar menu lateral" : "Plegar menu lateral"}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-700"
          >
            <Menu className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Seccion de Navegacion */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <p className="text-[10px] font-semibold sidebar-section-title uppercase tracking-wider font-mono">
                {isClient ? "Mi Portal" : "Modulos del Sistema"}
              </p>
            </div>
          )}

          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md text-xs font-medium transition-colors group relative",
                    isCollapsed
                      ? "justify-center py-2.5 px-0"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "sidebar-nav-active font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 sidebar-nav-icon",
                      isActive
                        ? ""
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />

                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.name}</span>
                  )}

                  {/* Tooltip corporativo en estado plegado */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[11px] font-medium rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Widget de Tasas de Cambio (USD BCV, EUR BCV, USDT) */}
        <RatesWidget isCollapsed={isCollapsed} />

        {/* Pie del Sidebar */}
        <div
          className={cn(
            "p-3 border-t border-slate-800 bg-slate-950/60 transition-all duration-300",
            isCollapsed ? "flex justify-center" : ""
          )}
        >
          {isCollapsed ? (
            <div
              title="Sistema en Linea (AutoGest Pro v1.2.0)"
              className="w-2.5 h-2.5 rounded-full sidebar-status-dot ring-2 ring-slate-900 my-1"
            />
          ) : (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">SYS-PROD v1.2.0</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full sidebar-status-dot"></span>
                  En Linea
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 font-mono">
                PostgreSQL / Vercel Edge
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Drawer Movil con Backdrop Overlay (en pantallas < 768px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop con desenfoque suave */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            aria-hidden="true"
          />

          {/* Contenedor del Drawer deslizante con superficie oscura fija */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full sidebar-surface border-r border-slate-800 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header del Drawer movil */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded sidebar-brand-badge border flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-white uppercase">
                    AutoGest Pro
                  </span>
                  <span className="text-[10px] sidebar-brand-subtitle font-mono tracking-wider">
                    {isClient ? "PORTAL DE CLIENTE" : "INGENIERIA & FLOTA"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMobileSidebar}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Cerrar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navegacion movil */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <p className="px-2 mb-2 text-[10px] font-semibold sidebar-section-title uppercase tracking-wider font-mono">
                {isClient ? "Mi Portal" : "Modulos del Sistema"}
              </p>
              <nav className="space-y-1">
                {currentNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "sidebar-nav-active font-semibold shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 sidebar-nav-icon",
                          isActive ? "" : "text-slate-400"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Widget de Tasas en movil */}
            <div className="border-t border-slate-800 p-1">
              <RatesWidget isCollapsed={false} />
            </div>

            {/* Pie movil */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">SYS-PROD v1.2.0</span>
                <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full sidebar-status-dot"></span>
                  En Linea
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
