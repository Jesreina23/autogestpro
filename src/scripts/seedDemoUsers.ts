import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDemoUsers() {
  // 1. Asegurar Cliente genérico de demostración: Juan Carlos Rodríguez
  let clienteDemo = await prisma.cliente.findFirst({
    where: { documentoIdentidad: "V-24.567.890" },
  });

  if (!clienteDemo) {
    clienteDemo = await prisma.cliente.create({
      data: {
        nombre: "Juan Carlos Rodríguez",
        documentoIdentidad: "V-24.567.890",
        telefono: "+58 414 1234567",
        correo: "juan.rodriguez@email.com",
      },
    });

    // Agregarle un vehículo de prueba para el portal
    await prisma.vehiculo.create({
      data: {
        marca: "Chevrolet",
        modelo: "Aveo LT",
        anio: 2014,
        placa: "AA123BC",
        tipo: "Carro",
        clienteId: clienteDemo.id,
      },
    });
  }

  // 2. Usuario Cliente @jrodriguez
  await prisma.usuario.upsert({
    where: { usuario: "jrodriguez" },
    update: {
      nombre: "Juan Carlos Rodríguez",
      password: "cli7890",
      rol: "CLIENTE",
      activo: true,
      clienteId: clienteDemo.id,
    },
    create: {
      nombre: "Juan Carlos Rodríguez",
      usuario: "jrodriguez",
      password: "cli7890",
      rol: "CLIENTE",
      activo: true,
      clienteId: clienteDemo.id,
    },
  });

  // 3. Usuario Mecánico @carlos.mendez
  await prisma.usuario.upsert({
    where: { usuario: "carlos.mendez" },
    update: {
      nombre: "Carlos Méndez",
      password: "mecanico2026",
      rol: "MECANICO_OPERADOR",
      activo: true,
      clienteId: null,
    },
    create: {
      nombre: "Carlos Méndez",
      usuario: "carlos.mendez",
      password: "mecanico2026",
      rol: "MECANICO_OPERADOR",
      activo: true,
      clienteId: null,
    },
  });

  // 4. Usuario Supervisor @supervisor
  await prisma.usuario.upsert({
    where: { usuario: "supervisor" },
    update: {
      nombre: "Ing. Supervisor Principal",
      password: "SuperClave2026!",
      rol: "ADMINISTRADOR",
      activo: true,
      clienteId: null,
    },
    create: {
      nombre: "Ing. Supervisor Principal",
      usuario: "supervisor",
      password: "SuperClave2026!",
      rol: "ADMINISTRADOR",
      activo: true,
      clienteId: null,
    },
  });

  console.log("Generic demo users ready in DB!");
}

seedDemoUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
