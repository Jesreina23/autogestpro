import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generarCandidatosUsername,
  generarClaveInicial,
} from "@/lib/generadorUsuario";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get("nombre") || "";
    const documento = searchParams.get("documento") || "";

    if (!nombre.trim()) {
      return NextResponse.json(
        { success: false, error: "El parametro 'nombre' es requerido." },
        { status: 400 }
      );
    }

    const candidatos = generarCandidatosUsername(nombre);

    // Buscar en la base de datos de usuarios si ya existen los candidatos
    const usuariosExistentes = await prisma.usuario.findMany({
      where: {
        usuario: {
          in: candidatos,
        },
      },
      select: {
        usuario: true,
      },
    });

    const setOcupados = new Set(usuariosExistentes.map((u) => u.usuario.toLowerCase()));

    // Encontrar el primer candidato libre
    let usernameDisponible = candidatos.find((c) => !setOcupados.has(c.toLowerCase()));

    if (!usernameDisponible) {
      // Fallback con timestamp si todos los candidatos calculados estuvieran tomados
      usernameDisponible = `${candidatos[0]}${Math.floor(100 + Math.random() * 900)}`;
    }

    const passwordSugerida = generarClaveInicial(documento);

    return NextResponse.json({
      success: true,
      username: usernameDisponible,
      passwordSugerida,
      candidatosEvaluados: candidatos.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Error al generar username automatico:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar nombre de usuario." },
      { status: 500 }
    );
  }
}

