import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ahora = new Date();
    // Fin del dia actual
    const finDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59, 999);

    // Consultar mantenimientos no completados
    const mantenimientosActivos = await prisma.mantenimiento.findMany({
      where: {
        estado: {
          in: ["PENDIENTE", "EN_PROCESO"],
        },
      },
      include: {
        vehiculo: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        fechaProgramada: "asc",
      },
      take: 20,
    });

    // Mantenimientos completados pero sin costo cargado
    const completadosSinCosto = await prisma.mantenimiento.findMany({
      where: {
        estado: "COMPLETADO",
        OR: [
          { costoManoObra: null },
          { costoManoObra: 0 },
        ],
      },
      include: {
        vehiculo: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    const notificaciones: Array<{
      id: string;
      mantenimientoId: string;
      tipo: "URGENTE" | "COSTOS" | "GARANTIA" | "PROCESO";
      titulo: string;
      mensaje: string;
      vehiculo: string;
      cliente: string;
      fechaProgramada: string;
      link: string;
    }> = [];

    // 1. Mantenimientos vencidos o para hoy
    for (const m of mantenimientosActivos) {
      const fechaProg = new Date(m.fechaProgramada);
      const esVencido = fechaProg < ahora;
      const esHoy = fechaProg <= finDeHoy && !esVencido;

      const vehiculoStr = `${m.vehiculo.marca} ${m.vehiculo.modelo} (${m.vehiculo.anio})`;
      const clienteStr = m.vehiculo.cliente.nombre;

      if (esVencido) {
        notificaciones.push({
          id: `vencido-${m.id}`,
          mantenimientoId: m.id,
          tipo: "URGENTE",
          titulo: "Mantenimiento Vencido",
          mensaje: `Orden #${m.id.substring(0, 8)} tiene fecha límite vencida (${fechaProg.toLocaleDateString("es-VE")}).`,
          vehiculo: vehiculoStr,
          cliente: clienteStr,
          fechaProgramada: m.fechaProgramada.toISOString(),
          link: `/mantenimientos`,
        });
      } else if (esHoy) {
        notificaciones.push({
          id: `hoy-${m.id}`,
          mantenimientoId: m.id,
          tipo: "URGENTE",
          titulo: "Servicio Programado Para Hoy",
          mensaje: `Orden #${m.id.substring(0, 8)} programada para atención el día de hoy.`,
          vehiculo: vehiculoStr,
          cliente: clienteStr,
          fechaProgramada: m.fechaProgramada.toISOString(),
          link: `/mantenimientos`,
        });
      }

      // 2. Garantias activas
      if (m.esGarantia) {
        notificaciones.push({
          id: `garantia-${m.id}`,
          mantenimientoId: m.id,
          tipo: "GARANTIA",
          titulo: "Servicio en Garantía",
          mensaje: `Orden #${m.id.substring(0, 8)} amparada bajo garantía técnica de taller.`,
          vehiculo: vehiculoStr,
          cliente: clienteStr,
          fechaProgramada: m.fechaProgramada.toISOString(),
          link: `/mantenimientos`,
        });
      }

      // 3. En Taller / En proceso
      if (m.estado === "EN_PROCESO" && !esVencido && !esHoy) {
        notificaciones.push({
          id: `proceso-${m.id}`,
          mantenimientoId: m.id,
          tipo: "PROCESO",
          titulo: "Unidad en Bahía de Servicio",
          mensaje: `Trabajo en proceso técnico actualmente en el taller.`,
          vehiculo: vehiculoStr,
          cliente: clienteStr,
          fechaProgramada: m.fechaProgramada.toISOString(),
          link: `/mantenimientos`,
        });
      }
    }

    // 4. Mantenimientos completados que faltan por costear
    for (const m of completadosSinCosto) {
      notificaciones.push({
        id: `costo-${m.id}`,
        mantenimientoId: m.id,
        tipo: "COSTOS",
        titulo: "Costos Pendientes por Cargar",
        mensaje: `Orden #${m.id.substring(0, 8)} completada pero sin costo de mano de obra ni horas cargadas.`,
        vehiculo: `${m.vehiculo.marca} ${m.vehiculo.modelo}`,
        cliente: m.vehiculo.cliente.nombre,
        fechaProgramada: m.fechaProgramada.toISOString(),
        link: `/mantenimientos`,
      });
    }

    return NextResponse.json({
      success: true,
      totalAlertas: notificaciones.length,
      data: notificaciones,
    });
  } catch (error: any) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron obtener las notificaciones operativas." },
      { status: 500 }
    );
  }
}

