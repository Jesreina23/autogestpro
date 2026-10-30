import { PrismaClient } from "@prisma/client";

async function resetUsers(connectionString: string, label: string) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    console.log(`[${label}] Conectando a la base de datos...`);

    // 1. Eliminar todos los usuarios existentes
    const deleted = await prisma.usuario.deleteMany({});
    console.log(`[${label}] Usuarios eliminados: ${deleted.count}`);

    // 2. Crear el usuario unico inicial Jesreina como ADMINISTRADOR
    const adminUser = await prisma.usuario.create({
      data: {
        nombre: "Jesús Reina",
        usuario: "jesreina",
        password: "Jesreina2026!",
        rol: "ADMINISTRADOR",
        activo: true,
        clienteId: null,
      },
    });

    console.log(`[${label}] Usuario desarrollador creado con exito:`);
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Nombre: ${adminUser.nombre}`);
    console.log(`- Usuario: @${adminUser.usuario}`);
    console.log(`- Rol: ${adminUser.rol}`);
    console.log(`- Clave inicial: Jesreina2026!`);
  } catch (error) {
    console.error(`[${label}] Error:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const localDb = "postgresql://postgres:postgres@127.0.0.1:5432/mantenimiento_db?schema=public";
  const neonDb = "postgresql://neondb_owner:npg_j0PHuhaF5wdI@ep-flat-dew-b64n98mm.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  console.log("=== INICIANDO PURGA Y CREACION DE USUARIO DESARROLLADOR ===");
  await resetUsers(localDb, "LOCAL POSTGRESQL");
  console.log("---------------------------------------------------------");
  await resetUsers(neonDb, "NEON CLOUD POSTGRESQL");
  console.log("=== PROCESO COMPLETADO EN AMBAS BASES DE DATOS ===");
}

main().catch((e) => {
  console.error("Fallo general:", e);
  process.exit(1);
});
