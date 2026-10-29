"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/context/UserContext";
import { Loader2, ShieldCheck } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useUser();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser && !isLoginPage) {
        router.replace("/login");
      } else if (currentUser && isLoginPage) {
        if (currentUser.rol === "CLIENTE") {
          router.replace("/vehiculos");
        } else {
          router.replace("/");
        }
      }
    }
  }, [currentUser, isLoading, isLoginPage, router]);

  // Si estamos en la pagina de login, renderizar sin barra lateral ni contenedor principal
  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-100 dark:bg-slate-950">{children}</main>;
  }

  // Pantalla de carga mientras se valida la sesion inicial
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg mb-4 animate-pulse">
          <ShieldCheck className="w-6 h-6 text-sky-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>Validando credenciales de acceso...</span>
        </div>
      </div>
    );
  }

  // Si no hay usuario y no es login, mostrar espera de redireccion
  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white select-none">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Barra de navegacion lateral plegable */}
      <Sidebar />

      {/* Area principal de trabajo */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        {children}
      </div>
    </div>
  );
}

