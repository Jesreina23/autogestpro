"use client";

import { useState, useEffect } from "react";
import { DollarSign, Euro, TrendingUp, RefreshCw, Layers } from "lucide-react";
import { formatBolivares } from "@/lib/utils";

interface RatesData {
  usdBcv: number;
  eurBcv: number;
  usdt: number;
  fechaActualizacion: string;
}

interface RatesWidgetProps {
  isCollapsed: boolean;
}

export function RatesWidget({ isCollapsed }: RatesWidgetProps) {
  const [rates, setRates] = useState<RatesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasas");
      const json = await res.json();
      if (json.success && json.data) {
        setRates(json.data);
      }
    } catch (err) {
      console.error("Error al cargar tasas en el widget:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Actualizar automaticamente cada 15 minutos
    const interval = setInterval(fetchRates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatBs = (val?: number) => {
    if (val === undefined || val === null) return "---";
    return formatBolivares(val);
  };

  // Estado Plegado (Sidebar Compacto)
  if (isCollapsed) {
    return (
      <div className="relative group px-2 py-2 flex justify-center">
        <button
          type="button"
          onClick={fetchRates}
          className="w-10 h-10 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Tasas de Cambio del Día"
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] font-mono font-bold leading-none text-slate-400 mt-0.5">
            VES
          </span>
        </button>

        {/* Tooltip flotante al pasar el cursor */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
          <div className="w-52 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-left space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Tasas de Cambio (VES)
              </span>
              <RefreshCw
                className={`w-3 h-3 text-slate-400 ${isLoading ? "animate-spin" : ""}`}
              />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> USD BCV:
                </span>
                <span className="font-bold text-white">
                  Bs. {formatBs(rates?.usdBcv)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Euro className="w-3 h-3 text-sky-400" /> EUR BCV:
                </span>
                <span className="font-bold text-white">
                  Bs. {formatBs(rates?.eurBcv)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> USDT:
                </span>
                <span className="font-bold text-white">
                  Bs. {formatBs(rates?.usdt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado Expandido (Sidebar Completo)
  return (
    <div className="px-3 py-2">
      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Tasas del Dia (VES)
            </span>
          </div>

          <button
            type="button"
            onClick={fetchRates}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Actualizar tasas"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? "animate-spin text-emerald-400" : ""}`}
            />
          </button>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          {/* USD BCV */}
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                $
              </div>
              <div>
                <span className="font-semibold text-slate-200">USD BCV</span>
                <span className="text-[9px] text-slate-500 block leading-none">Oficial</span>
              </div>
            </div>
            <span className="font-bold text-emerald-400 text-xs">
              {formatBs(rates?.usdBcv)} Bs.
            </span>
          </div>

          {/* EUR BCV */}
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                €
              </div>
              <div>
                <span className="font-semibold text-slate-200">EUR BCV</span>
                <span className="text-[9px] text-slate-500 block leading-none">Oficial</span>
              </div>
            </div>
            <span className="font-bold text-sky-400 text-xs">
              {formatBs(rates?.eurBcv)} Bs.
            </span>
          </div>

          {/* USDT */}
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                ₮
              </div>
              <div>
                <span className="font-semibold text-slate-200">USDT</span>
                <span className="text-[9px] text-slate-500 block leading-none">P2P / Paralelo</span>
              </div>
            </div>
            <span className="font-bold text-amber-400 text-xs">
              {formatBs(rates?.usdt)} Bs.
            </span>
          </div>
        </div>

        <p className="text-[9px] text-slate-500 text-center font-sans">
          Sincronizacion automatica cada 15 min
        </p>
      </div>
    </div>
  );
}
