import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuario, password } = body;

    if (!usuario || typeof usuario !== "string" || !usuario.trim()) {
      return NextResponse.json(
        { success: false, error: "Ingrese su nombre de usuario." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { success: false, error: "Ingrese su contraseña." },
        { status: 400 }
      );
    }

    // Normalizar usuario: remover '@' inicial si fue ingresado, pasar a minusculas y recortar
    const usuarioNormalizado = usuario.trim().toLowerCase().replace(/^@/, "");

    const user = await prisma.usuario.findUnique({
      where: { usuario: usuarioNormalizado },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            documentoIdentidad: true,
            telefono: true,
            correo: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nombre de usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        {
          success: false,
          error: "Esta cuenta se encuentra inhabilitada. Comuníquese con la administración del taller.",
        },
        { status: 403 }
      );
    }

    if (user.password !== password.trim()) {
      return NextResponse.json(
        { success: false, error: "Nombre de usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // Retornar datos de sesion sin exponer la clave
    const { password: _, ...userSafe } = user;

    return NextResponse.json({
      success: true,
      message: "Sesión iniciada correctamente.",
      user: userSafe,
    });
  } catch (error: any) {
    console.error("Error en endpoint de login:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor al autenticar usuario." },
      { status: 500 }
    );
  }
}

