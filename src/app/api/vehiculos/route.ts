import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        cliente: true,
        _count: {
          select: { mantenimientos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: vehiculos });
  } catch (error) {
    console.error("Error al obtener vehiculos:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al consultar vehiculos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placa, marca, modelo, anio, clienteId, tipo } = body;

    if (!marca || !modelo || !anio || !clienteId) {
      return NextResponse.json(
        { success: false, error: "El cliente, marca, modelo y año son obligatorios." },
        { status: 400 }
      );
    }

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        placa: placa && placa.trim() ? placa.trim().toUpperCase() : null,
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: Number(anio),
        tipo: tipo ? tipo.trim() : "Carro",
        clienteId,
      },
      include: {
        cliente: true,
      },
    });

    return NextResponse.json({ success: true, data: nuevoVehiculo }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar vehiculo:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Ya existe un vehiculo registrado con esta placa." },
        { status: 409 }
      );
    }

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
      { success: false, error: "Error al procesar la creacion del vehiculo." },
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
        { success: false, error: "El identificador del vehiculo es obligatorio." },
        { status: 400 }
      );
    }

    const vehiculoEliminado = await prisma.vehiculo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Vehiculo eliminado correctamente de la flota.",
      data: vehiculoEliminado,
    });
  } catch (error: any) {
    console.error("Error al eliminar vehiculo:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "El vehiculo no existe o ya fue eliminado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al procesar la eliminacion del vehiculo." },
      { status: 500 }
    );
  }
}

