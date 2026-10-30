"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const { themeMode, setThemeMode } = useTheme();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setErrorMessage("Por favor complete todos los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(usuario, password);

    if (!result.success) {
      setErrorMessage(result.error || "Usuario o contraseña inválidos.");
      setIsSubmitting(false);
      return;
    }

    // Redireccion inteligente segun el rol autenticado
    if (result.user?.rol === "CLIENTE") {
      router.replace("/vehiculos");
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-hidden select-none">
      {/* Fondo con cuadricula de ingenieria sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Barra superior con marca y toggle de modo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              AutoGest Pro
            </span>
            <span className="text-[10px] block text-slate-400 font-mono tracking-widest uppercase">
              Ingeniería & Flota
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Alternar modo visual"
        >
          {themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>
      </header>

      {/* Contenedor Central del Formulario */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 text-sky-400 shadow-inner mb-1">
              <Wrench className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Ingrese con sus credenciales de taller o su cuenta de cliente titular
            </p>
          </div>

          {/* Mensaje de Error */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuario */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Nombre de Usuario
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario (ej. @usuario)"
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Puede ingresar su usuario con o sin @ (ej. usuario o @usuario)
              </p>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Boton Principal */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 font-mono mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Pie de Pagina */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 font-mono">
        AutoGest Pro &bull; Plataforma Integral de Mantenimiento Automotriz e Ingeniería de Flotas
      </footer>
    </div>
  );
}
