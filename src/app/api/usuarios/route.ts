import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        cliente: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: usuarios });
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar usuarios en base de datos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, usuario, rol, password, clienteId } = body;

    if (!nombre || !usuario || !rol) {
      return NextResponse.json(
        { success: false, error: "Nombre completo, nombre de usuario y rol son requeridos." },
        { status: 400 }
      );
    }

    const usuarioLimpio = usuario.trim().toLowerCase().replace(/\s+/g, '_');
    const existe = await prisma.usuario.findUnique({
      where: { usuario: usuarioLimpio },
    });

    if (existe) {
      return NextResponse.json(
        { success: false, error: `Ya existe una cuenta con el nombre de usuario "${usuarioLimpio}".` },
        { status: 409 }
      );
    }

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        usuario: usuarioLimpio,
        rol,
        password: password?.trim() || "123456",
        clienteId: clienteId || null,
        activo: true,
      },
      include: {
        cliente: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Usuario creado exitosamente.", data: nuevoUsuario },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar el alta de usuario." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, newPassword, rol, activo, nombre, correo, clienteId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido." },
        { status: 400 }
      );
    }

    // Accion especial: Restablecimiento de Clave
    if (action === "RESET_PASSWORD") {
      if (!newPassword || newPassword.trim().length < 4) {
        return NextResponse.json(
          { success: false, error: "La nueva clave debe tener al menos 4 caracteres." },
          { status: 400 }
        );
      }

      const actualizado = await prisma.usuario.update({
        where: { id },
        data: { password: newPassword.trim() },
        include: { cliente: true },
      });

      return NextResponse.json({
        success: true,
        message: "Contraseña restablecida correctamente.",
        data: actualizado,
      });
    }

    // Actualizacion regular de perfil/rol/estado
    const dataToUpdate: any = {};
    if (rol !== undefined) dataToUpdate.rol = rol;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (clienteId !== undefined) dataToUpdate.clienteId = clienteId || null;
    if (correo !== undefined) dataToUpdate.correo = correo.trim().toLowerCase();

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      include: { cliente: true },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: usuarioActualizado,
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar usuario." },
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
        { success: false, error: "ID de usuario requerido para eliminacion." },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente del sistema.",
    });
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar el usuario de la base de datos." },
      { status: 500 }
    );
  }
}

