import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      include: {
        vehiculo: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: { fechaProgramada: "asc" },
    });

    return NextResponse.json({ success: true, data: mantenimientos });
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al consultar ordenes de mantenimiento." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fechaProgramada,
      descripcionServicio,
      vehiculoId,
      estado,
      kilometraje,
      horasHombre,
      costoManoObra,
      costoManoObraBs,
      tasaCambio,
      esGarantia,
    } = body;

    if (!fechaProgramada || !descripcionServicio || !vehiculoId) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios incompletos." },
        { status: 400 }
      );
    }

    const nuevoMantenimiento = await prisma.mantenimiento.create({
      data: {
        fechaProgramada: new Date(fechaProgramada),
        descripcionServicio: descripcionServicio.trim(),
        vehiculoId,
        estado: estado || "PENDIENTE",
        kilometraje: kilometraje !== undefined && kilometraje !== null && kilometraje !== "" ? Number(kilometraje) : null,
        horasHombre: horasHombre !== undefined && horasHombre !== null && horasHombre !== "" ? Number(horasHombre) : null,
        costoManoObra: costoManoObra !== undefined && costoManoObra !== null && costoManoObra !== "" ? Number(costoManoObra) : null,
        costoManoObraBs: costoManoObraBs !== undefined && costoManoObraBs !== null && costoManoObraBs !== "" ? Number(costoManoObraBs) : null,
        tasaCambio: tasaCambio !== undefined && tasaCambio !== null && tasaCambio !== "" ? Number(tasaCambio) : null,
        esGarantia: Boolean(esGarantia),
      },
      include: {
        vehiculo: {
          include: { cliente: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: nuevoMantenimiento },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al registrar mantenimiento:", error);
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo conectar con el servidor de base de datos PostgreSQL. Verifique su servicio local o la variable DATABASE_URL en .env.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al procesar la creacion del mantenimiento." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, horasHombre, costoManoObra, costoManoObraBs, tasaCambio, kilometraje, esGarantia, descripcionServicio } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID de la orden de mantenimiento es obligatorio." },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (estado !== undefined) dataToUpdate.estado = estado;
    if (horasHombre !== undefined) {
      dataToUpdate.horasHombre = horasHombre !== null && horasHombre !== "" ? Number(horasHombre) : null;
    }
    if (costoManoObra !== undefined) {
      dataToUpdate.costoManoObra = costoManoObra !== null && costoManoObra !== "" ? Number(costoManoObra) : null;
    }
    if (costoManoObraBs !== undefined) {
      dataToUpdate.costoManoObraBs = costoManoObraBs !== null && costoManoObraBs !== "" ? Number(costoManoObraBs) : null;
    }
    if (tasaCambio !== undefined) {
      dataToUpdate.tasaCambio = tasaCambio !== null && tasaCambio !== "" ? Number(tasaCambio) : null;
    }
    if (kilometraje !== undefined) {
      dataToUpdate.kilometraje = kilometraje !== null && kilometraje !== "" ? Number(kilometraje) : null;
    }
    if (esGarantia !== undefined) {
      dataToUpdate.esGarantia = Boolean(esGarantia);
    }
    if (descripcionServicio !== undefined) {
      dataToUpdate.descripcionServicio = descripcionServicio.trim();
    }

    const mantenimientoActualizado = await prisma.mantenimiento.update({
      where: { id },
      data: dataToUpdate,
      include: {
        vehiculo: {
          include: { cliente: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orden de mantenimiento actualizada correctamente.",
      data: mantenimientoActualizado,
    });
  } catch (error: any) {
    console.error("Error al actualizar orden de mantenimiento:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la orden en la base de datos." },
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
        { success: false, error: "El identificador de la orden es obligatorio." },
        { status: 400 }
      );
    }

    const mantenimientoEliminado = await prisma.mantenimiento.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Orden de mantenimiento eliminada correctamente.",
      data: mantenimientoEliminado,
    });
  } catch (error: any) {
    console.error("Error al eliminar mantenimiento:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "La orden especificada no existe o ya fue eliminada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al procesar la eliminacion del mantenimiento." },
      { status: 500 }
    );
  }
}

