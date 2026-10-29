import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTable() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NivelPermiso') THEN
        CREATE TYPE "NivelPermiso" AS ENUM ('TOTAL', 'OPERACION', 'CONSULTA', 'NINGUNO');
      END IF;
    END$$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "permisos_rol" (
      "id" TEXT PRIMARY KEY,
      "rol" "RolUsuario" NOT NULL,
      "modulo" TEXT NOT NULL,
      "nivel" "NivelPermiso" NOT NULL DEFAULT 'CONSULTA',
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "permisos_rol_rol_modulo_key" UNIQUE ("rol", "modulo")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "permisos_rol_rol_idx" ON "permisos_rol"("rol");
  `);

  console.log("Tabla permisos_rol creada exitosamente!");
}

createTable()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

