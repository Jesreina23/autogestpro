# Sistema de Gestion de Mantenimiento Vehicular

Plataforma web de arquitectura corporativa desarrollada en Next.js, Tailwind CSS y Prisma ORM, optimizada para despliegue en entornos Serverless sobre Vercel y base de datos PostgreSQL externa (Neon o Supabase).

---

## Documentacion Tecnica Central

- **[Documento de Arquitectura de Software](ARCHITECTURE.md):** Contiene la justificacion tecnica, diagrama de capas, diagrama Entidad-Relacion (ERD), optimizaciones serverless y estructura completa de directorios.
- **[Registro de Cambios (Changelog)](CHANGELOG.md):** Historico de versiones, modificaciones y adiciones del proyecto bajo el estandar SemVer.

---

## Requisitos Previos

- **Node.js:** Version 18.18.0 o superior (recomendado 20.x o 22.x LTS).
- **Gestor de paquetes:** `npm` v9+ o `pnpm`.
- **Base de datos PostgreSQL:** Instancia activa en Neon, Supabase o local.

---

## Ejecucion Rapida Mediante Scripts (Windows)

El proyecto cuenta con un conjunto de utilidades en la carpeta [`scripts/`](scripts/README.md) para ejecutar tareas operativas mediante doble clic o consola:

* **Iniciar en desarrollo:** Doble clic en `scripts\dev.bat` (o ejecutar `.\scripts\dev.ps1` en PowerShell).
* **Configuracion inicial completa:** Doble clic en `scripts\setup.bat`.
* **Explorador de base de datos (Prisma Studio):** Doble clic en `scripts\db-studio.bat`.
* **Sincronizar base de datos (Migrate):** Doble clic en `scripts\db-migrate.bat`.
* **Compilar para produccion:** Doble clic en `scripts\build.bat`.

---

## Instrucciones de Instalacion y Puesta en Marcha Manual

### 1. Clonar o acceder al directorio del proyecto

```bash
cd ProgramaMatenimiento
```

### 2. Configurar Variables de Entorno

Copiar el archivo de plantilla `.env.example` a `.env` y configurar las cadenas de conexion de PostgreSQL:

```bash
cp .env.example .env
```

Configurar los parametros en `.env`:
- `DATABASE_URL`: Cadena con parametro de pooler (ej. `?sslmode=require&pgbouncer=true`).
- `DIRECT_URL`: Cadena de conexion directa para ejecucion de migraciones DDL con Prisma.

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Generar el Cliente de Prisma y Sincronizar Esquema

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en `http://localhost:3000`.

---

## Despliegue en Vercel

1. Vincular el repositorio a una cuenta de Vercel.
2. En la configuracion del proyecto en Vercel, agregar las variables de entorno `DATABASE_URL` y `DIRECT_URL`.
3. Configurar el comando de construccion predeterminado (`npm run build`), el cual ejecuta `prisma generate && next build`.

