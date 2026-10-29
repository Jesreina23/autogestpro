import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generarCandidatosUsername,
  generarClaveInicial,
} from "@/lib/generadorUsuario";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        _count: {
          select: { vehiculos: true },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ success: true, data: clientes });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al consultar directorio de clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      documentoIdentidad,
      telefono,
      correo,
      crearUsuario = true,
      usuarioPersonalizado,
      passwordPersonalizada,
    } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre o razon social del cliente es obligatorio.",
        },
        { status: 400 }
      );
    }

    const nombreLimpio = nombre.trim();
    const docLimpio =
      documentoIdentidad && documentoIdentidad.trim()
        ? documentoIdentidad.trim().toUpperCase()
        : null;

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre: nombreLimpio,
        documentoIdentidad: docLimpio,
        telefono: telefono ? telefono.trim() : null,
        correo: correo ? correo.trim().toLowerCase() : null,
      },
    });

    let usuarioCreadoInfo: { usuario: string; passwordInicial: string } | null = null;

    // Crear cuenta de acceso al portal automaticamente si esta habilitado
    if (crearUsuario) {
      let usernameTarget = usuarioPersonalizado?.trim().toLowerCase().replace(/\s+/g, '_');

      if (!usernameTarget) {
        // Resolver automaticamente segun iniciales y primer apellido con desambiguacion
        const candidatos = generarCandidatosUsername(nombreLimpio);
        const usuariosExistentes = await prisma.usuario.findMany({
          where: {
            usuario: { in: candidatos },
          },
          select: { usuario: true },
        });

        const setOcupados = new Set(usuariosExistentes.map((u) => u.usuario.toLowerCase()));
        usernameTarget = candidatos.find((c) => !setOcupados.has(c.toLowerCase()));

        if (!usernameTarget) {
          usernameTarget = `${candidatos[0]}${Math.floor(100 + Math.random() * 900)}`;
        }
      }

      const passTarget =
        passwordPersonalizada?.trim() || generarClaveInicial(docLimpio);

      try {
        const nuevoUsuario = await prisma.usuario.create({
          data: {
            nombre: nombreLimpio,
            usuario: usernameTarget,
            password: passTarget,
            rol: "CLIENTE",
            clienteId: nuevoCliente.id,
            activo: true,
          },
        });

        usuarioCreadoInfo = {
          usuario: nuevoUsuario.usuario,
          passwordInicial: passTarget,
        };
      } catch (errUser: any) {
        console.warn("No se pudo crear el usuario automatico del cliente:", errUser.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: nuevoCliente,
        usuarioCreado: usuarioCreadoInfo,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al registrar cliente:", error);
    if (error?.code === "P2002") {
      const campoDuplicado = error.meta?.target?.[0] ?? "registro";
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe un cliente con este ${campoDuplicado === "correo" ? "correo electronico" : "documento de identidad"}.`,
        },
        { status: 409 }
      );
    }

    if (error?.code === "P1001" || error?.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo establecer conexion con el servidor de base de datos PostgreSQL (localhost:5432). Verifique que el servicio este activo o configure la cadena DATABASE_URL en su archivo .env.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al procesar el registro del cliente." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El identificador del cliente es obligatorio." },
        { status: 400 }
      );
    }

    const clienteEliminado = await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Cliente y sus dependencias eliminados correctamente.",
      data: clienteEliminado,
    });
  } catch (error: any) {
    console.error("Error al eliminar cliente:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "El cliente especificado no existe o ya fue eliminado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al procesar la eliminacion del cliente." },
      { status: 500 }
    );
  }
}

