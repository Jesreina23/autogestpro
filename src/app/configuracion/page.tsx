import { Header } from "@/components/layout/Header";
import { ConfiguracionClient } from "@/components/configuracion/ConfiguracionClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const [opciones, usuarios, clientes, permisos] = await Promise.all([
    prisma.opcionCatalogo.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }, { valor: "asc" }],
    }),
    prisma.usuario.findMany({
      include: { cliente: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cliente.findMany({
      select: { id: true, nombre: true, documentoIdentidad: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.permisoRol.findMany({
      orderBy: [{ rol: "asc" }, { modulo: "asc" }],
    }),
  ]);

  return (
    <>
      <Header
        title="Configuracion del Sistema"
        subtitle="Administracion de plantillas maestras, temas visuales y gestion de usuarios"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <ConfiguracionClient
          initialOpciones={opciones}
          initialUsuarios={usuarios}
          clientes={clientes}
          initialPermisos={permisos}
        />
      </main>
    </>
  );
}

