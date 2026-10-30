import { PrismaClient } from "@prisma/client";

const MARCAS_BASE = [
  "Chevrolet",
  "Ford",
  "Toyota",
  "Hyundai",
  "Nissan",
  "Honda",
  "Chery",
  "Fiat",
  "Renault",
  "Mitsubishi",
  "Kia",
  "Peugeot",
  "Volkswagen",
  "Jeep",
  "Dodge",
  "Mazda",
  "Suzuki",
  "Jac",
  "Geely global",
  "Daihatsu",
  "Bera",
  "Empire Keeway",
  "United Motors",
];

const TIPOS_VEHICULO_BASE = [
  "Carro",
  "Moto",
  "Camioneta",
  "Camion",
  "Autobus",
];

const TIPOS_SERVICIO_BASE = [
  "Cambio de Aceite y Filtros",
  "Sistema de Frenos (Pastillas / Discos)",
  "Alineacion, Balanceo y Rotacion",
  "Revision de Sistema Electrico y Bateria",
  "Suspension y Amortiguadores",
  "Mantenimiento Preventivo Integral",
  "Inyectores y Sistema de Combustible",
  "Transmision y Embrague",
  "Diagnostico Computarizado",
  "Motor",
];

async function seedCatalogosParaConexion(connectionString: string, label: string) {
  const prisma = new PrismaClient({
    datasources: { db: { url: connectionString } },
  });

  console.log(`[${label}] Sincronizando catalogos maestros...`);

  try {
    // 1. Sincronizar Marcas de Vehiculo
    for (let i = 0; i < MARCAS_BASE.length; i++) {
      const marca = MARCAS_BASE[i];
      await prisma.opcionCatalogo.upsert({
        where: {
          categoria_valor: {
            categoria: "MARCA_VEHICULO",
            valor: marca,
          },
        },
        update: {
          activo: true,
          orden: i,
        },
        create: {
          categoria: "MARCA_VEHICULO",
          valor: marca,
          orden: i,
          activo: true,
        },
      });
    }
    console.log(`[${label}] Marcas sincronizadas: ${MARCAS_BASE.length}`);

    // 2. Sincronizar Tipos de Vehiculo
    for (let i = 0; i < TIPOS_VEHICULO_BASE.length; i++) {
      const tipo = TIPOS_VEHICULO_BASE[i];
      await prisma.opcionCatalogo.upsert({
        where: {
          categoria_valor: {
            categoria: "TIPO_VEHICULO",
            valor: tipo,
          },
        },
        update: {
          activo: true,
          orden: i,
        },
        create: {
          categoria: "TIPO_VEHICULO",
          valor: tipo,
          orden: i,
          activo: true,
        },
      });
    }
    console.log(`[${label}] Tipos de vehiculo sincronizados: ${TIPOS_VEHICULO_BASE.length}`);

    // 3. Sincronizar Tipos de Servicio
    for (let i = 0; i < TIPOS_SERVICIO_BASE.length; i++) {
      const servicio = TIPOS_SERVICIO_BASE[i];
      await prisma.opcionCatalogo.upsert({
        where: {
          categoria_valor: {
            categoria: "TIPO_SERVICIO",
            valor: servicio,
          },
        },
        update: {
          activo: true,
          orden: i,
        },
        create: {
          categoria: "TIPO_SERVICIO",
          valor: servicio,
          orden: i,
          activo: true,
        },
      });
    }
    console.log(`[${label}] Tipos de servicio sincronizados: ${TIPOS_SERVICIO_BASE.length}`);

  } catch (error) {
    console.error(`[${label}] Error al sincronizar catalogos:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const localDb = "postgresql://postgres:postgres@127.0.0.1:5432/mantenimiento_db?schema=public";
  const neonDb = "postgresql://neondb_owner:npg_j0PHuhaF5wdI@ep-flat-dew-b64n98mm.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  console.log("=== INICIANDO SINCRONIZACION DE CATALOGOS MAESTROS ===");
  await seedCatalogosParaConexion(localDb, "LOCAL POSTGRESQL");
  console.log("------------------------------------------------------");
  await seedCatalogosParaConexion(neonDb, "NEON CLOUD POSTGRESQL");
  console.log("=== CATALOGOS COMPLETAMENTE SINCRONIZADOS ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
