import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RolUsuario, NivelPermiso } from "@/types";
import { MODULOS_SISTEMA, PERMISOS_DEFAULT } from "@/lib/permisosDefaults";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let registros = await prisma.permisoRol.findMany({
      orderBy: [{ rol: "asc" }, { modulo: "asc" }],
    });

    // Si la tabla esta vacia, inicializarla con los valores por defecto
    if (registros.length === 0) {
      const dataToInsert: any[] = [];
      const roles: RolUsuario[] = ["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"];

      for (const rol of roles) {
        for (const modulo of MODULOS_SISTEMA) {
          const nivel = PERMISOS_DEFAULT[rol]?.[modulo.id] || "CONSULTA";
          dataToInsert.push({
            id: `${rol}_${modulo.id}`,
            rol,
            modulo: modulo.id,
            nivel,
          });
        }
      }

      await prisma.permisoRol.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });

      registros = await prisma.permisoRol.findMany({
        orderBy: [{ rol: "asc" }, { modulo: "asc" }],
      });
    }

    return NextResponse.json({
      success: true,
      data: registros,
      modulos: MODULOS_SISTEMA,
      defaults: PERMISOS_DEFAULT,
    });
  } catch (error: any) {
    console.error("Error al obtener matriz de permisos:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar permisos en base de datos." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cambios, action } = body;

    // Accion especial: Restablecer valores de fabrica
    if (action === "RESET_DEFAULTS") {
      const roles: RolUsuario[] = ["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"];

      for (const rol of roles) {
        for (const modulo of MODULOS_SISTEMA) {
          const nivel = PERMISOS_DEFAULT[rol]?.[modulo.id] || "CONSULTA";
          await prisma.permisoRol.upsert({
            where: {
              rol_modulo: { rol, modulo: modulo.id },
            },
            update: { nivel },
            create: {
              id: `${rol}_${modulo.id}`,
              rol,
              modulo: modulo.id,
              nivel,
            },
          });
        }
      }

      const actualizados = await prisma.permisoRol.findMany({
        orderBy: [{ rol: "asc" }, { modulo: "asc" }],
      });

      return NextResponse.json({
        success: true,
        message: "Permisos restablecidos a los valores por defecto exitosamente.",
        data: actualizados,
      });
    }

    // Actualizacion de cambios especificos
    if (!Array.isArray(cambios) || cambios.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se proporcionaron cambios para actualizar." },
        { status: 400 }
      );
    }

    // Validacion de seguridad: el Administrador siempre debe conservar acceso total a la configuracion
    for (const item of cambios) {
      if (item.rol === "ADMINISTRADOR" && item.modulo === "configuracion" && item.nivel === "NINGUNO") {
        return NextResponse.json(
          {
            success: false,
            error: "El rol de Administrador no puede ser bloqueado del módulo de Configuración para prevenir pérdidas de acceso.",
          },
          { status: 400 }
        );
      }
    }

    // Aplicar cada cambio en transaccion
    await prisma.$transaction(
      cambios.map((c: { rol: RolUsuario; modulo: string; nivel: NivelPermiso }) =>
        prisma.permisoRol.upsert({
          where: {
            rol_modulo: { rol: c.rol, modulo: c.modulo },
          },
          update: {
            nivel: c.nivel,
          },
          create: {
            id: `${c.rol}_${c.modulo}`,
            rol: c.rol,
            modulo: c.modulo,
            nivel: c.nivel,
          },
        })
      )
    );

    const actualizados = await prisma.permisoRol.findMany({
      orderBy: [{ rol: "asc" }, { modulo: "asc" }],
    });

    return NextResponse.json({
      success: true,
      message: "Matriz de permisología actualizada correctamente en base de datos.",
      data: actualizados,
    });
  } catch (error: any) {
    console.error("Error al actualizar permisos:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al guardar cambios de permisos." },
      { status: 500 }
    );
  }
}

