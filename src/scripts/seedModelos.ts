import { PrismaClient } from "@prisma/client";
import { MODELOS_VENEZUELA_POR_MARCA, getCategoriaModelo } from "../lib/catalogoModelos";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando actualizacion detallada de modelos venezolanos...");

  // Eliminar opciones de modelo previas para repoblar con las versiones desglosadas
  const eliminados = await prisma.opcionCatalogo.deleteMany({
    where: {
      categoria: {
        startsWith: "MODELO_",
      },
    },
  });
  console.log(`Modelos anteriores limpiados: ${eliminados.count}`);

  let totalInsertados = 0;

  for (const [marca, modelos] of Object.entries(MODELOS_VENEZUELA_POR_MARCA)) {
    const categoria = getCategoriaModelo(marca);

    for (let i = 0; i < modelos.length; i++) {
      const modelo = modelos[i];

      try {
        await prisma.opcionCatalogo.create({
          data: {
            categoria,
            valor: modelo,
            orden: i + 1,
            activo: true,
          },
        });
        totalInsertados++;
      } catch (err: any) {
        console.error(`Error al insertar ${modelo} para ${marca}:`, err.message);
      }
    }
  }

  console.log(`Actualizacion finalizada con exito:`);
  console.log(`- Total de modelos y versiones detalladas registradas: ${totalInsertados}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
