import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoriaModelo } from "@/lib/catalogoModelos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");

    if (marca) {
      categoria = getCategoriaModelo(marca);
    }

    let where: any = { activo: true };

    if (categoria) {
      if (categoria === "MODELOS_TODOS") {
        where = { activo: true, categoria: { startsWith: "MODELO_" } };
      } else {
        where = { activo: true, categoria };
      }
    }

    const opciones = await prisma.opcionCatalogo.findMany({
      where,
      orderBy: [{ orden: "asc" }, { valor: "asc" }],
    });

    return NextResponse.json({ success: true, data: opciones });
  } catch (error: any) {
    console.error("Error al obtener opciones de catalogo:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar las opciones del catalogo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { categoria, valor, marca } = body;

    if (marca && (categoria === "MODELO_VEHICULO" || !categoria)) {
      categoria = getCategoriaModelo(marca);
    }

    if (!categoria || !valor || !valor.trim()) {
      return NextResponse.json(
        { success: false, error: "La categoria y el valor son obligatorios." },
        { status: 400 }
      );
    }

    const valorLimpio = valor.trim();

    // Comprobar si ya existe
    const existe = await prisma.opcionCatalogo.findUnique({
      where: {
        categoria_valor: {
          categoria,
          valor: valorLimpio,
        },
      },
    });

    if (existe) {
      if (!existe.activo) {
        // Reactivar si estaba inactivo
        const reactivado = await prisma.opcionCatalogo.update({
          where: { id: existe.id },
          data: { activo: true },
        });
        return NextResponse.json({ success: true, data: reactivado });
      }

      return NextResponse.json(
        { success: false, error: `La opcion "${valorLimpio}" ya existe en esta plantilla.` },
        { status: 409 }
      );
    }

    const nuevaOpcion = await prisma.opcionCatalogo.create({
      data: {
        categoria,
        valor: valorLimpio,
      },
    });

    return NextResponse.json({ success: true, data: nuevaOpcion }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar opcion de catalogo:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar la nueva opcion en el catalogo." },
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
        { success: false, error: "El ID de la opcion es requerido para eliminar." },
        { status: 400 }
      );
    }

    const opcionEliminada = await prisma.opcionCatalogo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Opcion eliminada del catalogo.",
      data: opcionEliminada,
    });
  } catch (error: any) {
    console.error("Error al eliminar opcion de catalogo:", error);
    return NextResponse.json(
      { success: false, error: "Error al remover la opcion del catalogo." },
      { status: 500 }
    );
  }
}

