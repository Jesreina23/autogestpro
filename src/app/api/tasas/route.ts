import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TasasCache {
  data: {
    usdBcv: number;
    eurBcv: number;
    usdt: number;
    fechaActualizacion: string;
  };
  timestamp: number;
}

let cachedTasas: TasasCache | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function GET() {
  const now = Date.now();

  if (cachedTasas && now - cachedTasas.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      data: cachedTasas.data,
      cached: true,
    });
  }

  try {
    const [resDolar, resEuro, resParalelo] = await Promise.all([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", { cache: "no-store" }),
      fetch("https://ve.dolarapi.com/v1/euros/oficial", { cache: "no-store" }),
      fetch("https://ve.dolarapi.com/v1/dolares/paralelo", { cache: "no-store" }),
    ]);

    const dataDolar = await resDolar.json();
    const dataEuro = await resEuro.json();
    const dataParalelo = await resParalelo.json();

    const tasasResult = {
      usdBcv: Number(dataDolar?.promedio) || 888.12,
      eurBcv: Number(dataEuro?.promedio) || 989.72,
      usdt: Number(dataParalelo?.promedio) || 1004.03,
      fechaActualizacion: dataDolar?.fechaActualizacion || new Date().toISOString(),
    };

    cachedTasas = {
      data: tasasResult,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      data: tasasResult,
      cached: false,
    });
  } catch (error) {
    console.error("Error al consultar tasas:", error);

    // Si falla la red pero tenemos cache previa, devolverla
    if (cachedTasas) {
      return NextResponse.json({
        success: true,
        data: cachedTasas.data,
        cached: true,
        fallback: true,
      });
    }

    // Valores referenciales seguros si no hay internet en absoluto
    return NextResponse.json({
      success: true,
      data: {
        usdBcv: 888.12,
        eurBcv: 989.72,
        usdt: 1004.03,
        fechaActualizacion: new Date().toISOString(),
      },
      fallback: true,
    });
  }
}
