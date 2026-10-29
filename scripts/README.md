# Scripts de Automatizacion y Ejecucion Operativa

Este directorio reune utilidades de linea de comandos para simplificar las tareas recurrentes de configuracion, ejecucion y administracion de base de datos en entornos Windows (Batch `.bat` y PowerShell `.ps1`).

---

## Catalogo de Scripts

### 1. Inicializacion del Proyecto (`setup.bat` / `setup.ps1`)
- **Proposito:** Configura el proyecto desde cero.
- **Acciones:**
  - Verifica la presencia del archivo `.env` (crea una copia desde `.env.example` si no existe).
  - Instala dependencias con `npm install`.
  - Genera el cliente tipado de Prisma ORM.

### 2. Entorno de Desarrollo (`dev.bat` / `dev.ps1`)
- **Proposito:** Inicia el servidor de desarrollo en `http://localhost:3000`.
- **Acciones:**
  - Realiza verificaciones preventivas de variables de entorno y `node_modules`.
  - Ejecuta `npm run dev`.

### 3. Compilacion de Produccion (`build.bat` / `build.ps1`)
- **Proposito:** Valida que el proyecto compile correctamente sin errores de TypeScript o rutas.
- **Acciones:**
  - Ejecuta `npx prisma generate`.
  - Ejecuta `npm run build`.

### 4. Migraciones de Base de Datos (`db-migrate.bat` / `db-migrate.ps1`)
- **Proposito:** Aplica cambios del archivo `prisma/schema.prisma` a la base de datos PostgreSQL conectada.
- **Acciones:**
  - Ejecuta `npx prisma migrate dev`.
  - Actualiza el cliente tipado `@prisma/client`.

### 5. Administrador Visual de Datos (`db-studio.bat` / `db-studio.ps1`)
- **Proposito:** Lanza la interfaz grafica de Prisma Studio en el navegador (`http://localhost:5555`).
- **Acciones:**
  - Permite explorar, insertar, editar o eliminar registros de clientes, vehiculos y mantenimientos directamente.

### 6. Control de Servidor PostgreSQL Local (`pg-start.bat` / `pg-stop.bat`)
- **Proposito:** Iniciar o detener la instancia local de PostgreSQL alojada en `C:\Desarrollo\pgsql`.
- **Acciones:**
  - `pg-start.bat` / `pg-start.ps1`: Inicia el servicio en `127.0.0.1:5432`.
  - `pg-stop.bat` / `pg-stop.ps1`: Detiene el servicio de forma limpia.

---

## Formas de Ejecucion

### Opcion A: Doble Clic (Explorador de Archivos)
Hacer doble clic sobre cualquiera de los archivos `.bat` (por ejemplo, `dev.bat`).

### Opcion B: Terminal (PowerShell / CMD)
Desde la raiz del proyecto:

```powershell
.\scripts\dev.ps1
```

O en consola de comandos:

```cmd
scripts\dev.bat
```

