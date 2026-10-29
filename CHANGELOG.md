# Registro de Cambios (Changelog)

Todos los cambios notables realizados en este proyecto se documentaran en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.27.0] - 2026-10-29

### Edición Interactiva y Persistencia de Permisos por Roles en Base de Datos

#### Agregado
- **Modelo de Permisos en PostgreSQL ([`prisma/schema.prisma`](file:///c:/Desarrollo/ProgramaMantenimiento/prisma/schema.prisma)):**
  - Nueva tabla `permisos_rol` y enumeración `NivelPermiso` (`TOTAL`, `OPERACION`, `CONSULTA`, `NINGUNO`) para gobernar las autorizaciones dinámicas de cada rol en cada módulo.
- **API REST de Permisos ([`/api/permisos`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/permisos/route.ts)):**
  - `GET`: Retorna los permisos persistidos e inicializa automáticamente los 28 registros estándar de fábrica si la base de datos está vacía.
  - `PUT`: Permite guardar modificaciones atómicas en lote por transacción o restablecer los valores estándar (`RESET_DEFAULTS`).
  - Protección de seguridad: Impide retirar el acceso total a la configuración para la cuenta de Administrador.
- **Matriz de Permisología Interactiva ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - Cada intersección entre rol y módulo cuenta ahora con un selector interactivo con estética adaptativa según el nivel seleccionado (*Acceso Total*, *Operación*, *Solo Lectura*, *Sin Acceso*).
  - Detección reactiva de cambios con alerta visual (*Hay cambios pendientes por guardar*).
  - Botón **Guardar Cambios** sincronizado con la base de datos PostgreSQL.
  - Botón **Por Defecto** para restablecer la política original del taller con 1 clic.

---

## [1.26.0] - 2026-10-29

### Matriz de Permisología y Control de Acceso por Roles

#### Agregado
- **Panel Informativo de los 4 Roles ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - Fichas interactivas en la pestaña *Roles y Usuarios* para cada uno de los 4 perfiles del sistema (`ADMINISTRADOR`, `SUPERVISOR`, `MECANICO_OPERADOR`, `CLIENTE`).
  - Muestra insignia cromática, descripción de responsabilidades principales y contador en tiempo real de cuentas asignadas en PostgreSQL.
- **Matriz Comparativa de Permisología por Apartado ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - Desglose de autorizaciones en los 7 módulos del sistema (*Panel de Control*, *Gestión de Clientes*, *Flota y Vehículos*, *Órdenes de Mantenimiento*, *Costeo y Finanzas*, *Reportes Técnicos* y *Configuración*).
  - Niveles de acceso clasificados visualmente con etiquetas e iconos:
    - *Acceso Total* (verde esmeralda).
    - *Operación* (azul cielo).
    - *Solo Lectura / Consulta* (púrpura).
    - *Sin Acceso / Restringido* (gris tenue).
  - Filtro dinámico para alternar entre vista comparativa completa o aislar un perfil específico con sus acciones permitidas.

---

## [1.25.0] - 2026-10-29

### Módulo de Autenticación, Inicio y Cierre de Sesión (Login / Logout)

#### Agregado
- **Página de Inicio de Sesión ([`/login`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/login/page.tsx)):**
  - Interfaz de acceso con estética industrial automotriz, soporte para modo claro/oscuro y paletas.
  - Campos de entrada: nombre de usuario con prefijo `@` flexible (permite escribir con o sin `@`) y contraseña con alternador visual de visibilidad.
  - Validación de credenciales con mensajes de error contextuales y botón con indicador de carga.
  - Panel de ejemplos de acceso rápido por perfil (1 clic para probar cada rol con credenciales reales):
    - *Supervisor / Taller:* `@supervisor` (control total y flota).
    - *Portal de Cliente:* `@jrodriguez` (Juan Carlos Rodríguez, Aveo LT).
    - *Mecánico Operador:* `@carlos.mendez` (bahía técnica).
  - Placeholders y textos de ayuda limpios y normalizados (`Ej. supervisor o jrodriguez`).
- **API REST de Autenticación ([`/api/auth/login`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/auth/login/route.ts)):**
  - Endpoint de autenticación que valida el identificador `@usuario`, comprueba que la cuenta esté activa y verifica la contraseña contra PostgreSQL.
  - Retorna de forma segura la ficha del usuario sin exponer su contraseña.
- **Envoltorio Estructural y Protección de Rutas ([`AppShell.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/AppShell.tsx)):**
  - Detecta la ruta activa y renderiza `/login` a pantalla completa sin barra lateral.
  - Redirección automática de visitantes no autenticados a `/login` y redirección de usuarios autenticados hacia su vista correspondiente.
- **Gestión Global de Sesión ([`UserContext.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/context/UserContext.tsx)):**
  - Métodos `login(usuario, password)` y `logout()`.
  - Eliminación del auto-logueo indiscriminado de supervisor, exigiendo credenciales reales.
- **Adaptabilidad de Navegación por Rol ([`Sidebar.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Sidebar.tsx)):**
  - Al autenticarse un usuario con rol `CLIENTE`, la barra lateral adapta su subtítulo a *PORTAL DE CLIENTE* y restringe los módulos mostrando exclusivamente *Mis Vehículos* y *Mis Mantenimientos*.
- **Cierre de Sesión en Cabecera ([`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx)):**
  - Botón *Cerrar Sesión* en el menú desplegable del perfil y en la pantalla de bloqueo operativo.

---

## [1.24.0] - 2026-10-29

### Generación Automática de Usernames y Contraseñas para Clientes

#### Agregado
- **Motor de Nombres de Usuario y Claves ([`src/lib/generadorUsuario.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/lib/generadorUsuario.ts)):**
  - Algoritmo inteligente con resolución secuencial de colisiones adaptado a nombres hispanos y venezolanos:
    - Prioridad 1: Primera letra del primer nombre + primer apellido (ej. *Carlos Alberto Gómez Ruiz* -> `@cgomez`).
    - Prioridad 2 (resolución de homónimos): Iniciales compuestas de nombres + apellido (ej. *Carlos Andrés Gómez Ruiz* -> `@cagomez`).
    - Prioridad 3: Inicial del nombre + primer apellido + inicial del segundo apellido (ej. `@cgomezr`).
    - Prioridad 4: Nombre completo separado por punto (ej. `@carlos.gomez`).
    - Prioridad 5 (respaldo numérico): `@cgomez1`, `@cgomez2`, etc.
  - Generación de contraseñas amigables basada en la cédula del cliente (`cli` + últimos 4 dígitos del documento de identidad, ej. `cli4567`) o respaldo general (`AutoGest2026*`).
- **Endpoint de Disponibilidad y Sugerencia ([`/api/usuarios/generar-username`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/usuarios/generar-username/route.ts)):**
  - Consulta en tiempo real la disponibilidad en la base de datos PostgreSQL y devuelve de inmediato el primer username disponible junto a su contraseña sugerida.
- **Registro de Clientes con Creación de Cuenta Automática ([`/clientes/nuevo`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/clientes/nuevo/page.tsx)):**
  - Caja de configuración de acceso al portal con switch interactivo (activado por defecto).
  - Previsualización en tiempo real del username generado y contraseña sugerida a medida que se ingresa el nombre y documento.
  - Creación atómica de la ficha de cliente y su usuario en la base de datos vinculado a través de `clienteId`.
  - Modal emergente de confirmación al registrar el cliente con botón de copiado rápido al portapapeles con formato preparado para enviar por WhatsApp.
- **Autocompletado en Configuración de Usuarios ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - Al seleccionar un titular en el rol `CLIENTE`, autocompleta el nombre, consulta el username único disponible y rellena la clave inicial sugerida.

---

## [1.23.0] - 2026-10-29

### Transición de Correos Corporativos a Nombres de Usuario Amigables (Usernames)

#### Cambiado
- **Modelo de Base de Datos y PostgreSQL ([`prisma/schema.prisma`](file:///c:/Desarrollo/ProgramaMantenimiento/prisma/schema.prisma)):**
  - Se migró el campo de identificación único `correo` por `usuario` (`username`), eliminando la exigencia de correos corporativos rígidos.
  - Los usuarios existentes en la base de datos se migraron a identificadores sencillos:
    - `supervisor@autogest.com` -> `@supervisor`
    - `carlos.mendez@autogest.com` -> `@carlos.mendez`
    - `cliente.jesus@email.com` -> `@jesus`
- **Módulo de Configuración ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - En la pestaña **Roles y Usuarios**, la columna de la tabla ahora se titula *Nombre de Usuario*.
  - El formulario de creación ahora solicita un nombre de usuario amigable precedido de `@` (ej. `@carlos`, `@admin`, `@mecanico_1`, `@jesus`).
  - Los modales de confirmación de eliminación y restablecimiento de contraseña ahora muestran el identificador amigable.
- **API REST de Usuarios ([`/api/usuarios/route.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/usuarios/route.ts)):**
  - Validación y normalización automática de nombres de usuario en minúsculas y sin espacios.
- **Cabecera y Menú de Perfil ([`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx)):**
  - Visualización del `@usuario` en la tarjeta de perfil, lista de cambio de operador y pantalla de bloqueo.

---

## [1.22.0] - 2026-10-29

### Menú Interactivo de Perfil, Cambio de Operador y Bloqueo de Sesión

#### Agregado
- **Contexto Global de Usuario ([`UserContext.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/context/UserContext.tsx)):**
  - Manejo de sesión persistente en `localStorage` sincronizado con la tabla de `usuarios` de PostgreSQL.
  - Soporte para alternar de operador en tiempo real entre los roles del sistema (`ADMINISTRADOR`, `SUPERVISOR`, `MECANICO_OPERADOR`, `CLIENTE`).
  - Capacidad de bloqueo y reanudación segura de pantalla de trabajo.
- **Menú Desplegable de Perfil ([`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx)):**
  - El botón superior del operador ahora es completamente interactivo.
  - Despliega tarjeta con avatar personalizado, nombre completo, correo y distintivo cromático según el rol.
  - Atajos rápidos a *Configuración y Roles* y *Apariencia y Paletas de Color*.
  - **Selector Rápido de Operador Activo:** Lista los demás usuarios registrados en la base de datos para cambiar de rol o usuario con 1 solo clic.
  - **Bloqueo de Sesión Operativa:** Función para pausar la consola con overlay de protección y reactivación inmediata.

---

## [1.21.0] - 2026-10-29

### Centro de Alertas y Notificaciones Operativas en Tiempo Real

#### Agregado
- **API REST de Notificaciones ([`/api/notificaciones/route.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/notificaciones/route.ts)):**
  - Motor de consulta que evalúa en tiempo real las órdenes de mantenimiento en PostgreSQL:
    - *Mantenimientos Vencidos o de Hoy:* Órdenes activas con fecha programada vencida o agendada para el día de hoy (prioridad urgente).
    - *Costos Pendientes de Cargar:* Órdenes cerradas o completadas que aún carecen de costo de mano de obra y horas cargadas.
    - *Garantías Técnicas Activas:* Órdenes bajo cobertura de garantía de taller.
    - *Servicios en Proceso:* Órdenes en bahía de trabajo técnico actualmente en curso.
- **Campanita Activa con Dropdown de Alertas ([`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx)):**
  - Contador numérico dinámico y pulso visual sobre la campanita cuando existen alertas críticas pendientes.
  - Panel desplegable con diseño corporativo:
    - Indicador de estado por color y tipo de alerta (*Urgente*, *Financiero/Costos*, *Garantía*, *Taller*).
    - Visualización del vehículo (marca/modelo/año) y cliente titular asociado a la orden.
    - Acceso directo en 1 clic a la orden y enlace rápido a la gestión completa de mantenimientos.
    - Cierre automático al hacer clic fuera del panel (*Click Outside Listener*).
    - Botón de refresco manual y sincronización automática periódica cada 2 minutos.

---

## [1.20.1] - 2026-10-29

### Desglose Profesional de Modelos y Versiones Populares de Venezuela

#### Mejorado
- **Desglose de Modelos en Opciones Discretas ([`catalogoModelos.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/lib/catalogoModelos.ts)):**
  - Cada generación, carrocería y versión popular en Venezuela ahora cuenta con su propia opción en la plantilla, totalizando **262 opciones especializadas**:
    - **Chevrolet:** `Aveo (3 Puertas)`, `Aveo (4 Puertas)`, `Aveo LT`, `Optra Design`, `Optra Limited`, `Optra Advance`, `Optra Hatchback`, `Corsa Speed`, `Corsa 1.6`, `Corsa 1.4`, `Corsa (4 Puertas)`, `Spark 1.0`, `Spark Chronos`, `Silverado C-1500`, `Silverado C-3500 (Rey Camión)`, `Tahoe 4x4`, `Grand Vitara XL-7`, etc.
    - **Toyota:** `Corolla Baby Camry`, `Corolla Sapito`, `Corolla Pantallita`, `Corolla New Sensation`, `Corolla GLi`, `Corolla 1.8 / 2.0`, `Hilux Kavak`, `Hilux 2.7 (4x2 / 4x4)`, `Hilux 4.0 (4x4)`, `Hilux Revo`, `Yaris Belfast (Hatchback)`, `Yaris Sol (Sedán)`, `Land Cruiser (Machito / Serie 70)`, `Land Cruiser (Samurai)`, `Land Cruiser (Autana / Serie 80)`, `Land Cruiser Prado (Merú)`, etc.
    - **Ford:** `Fiesta Power`, `Fiesta Max`, `Fiesta Move`, `Fiesta Titanium`, `Fiesta Balita`, `Explorer Eddie Bauer`, `Explorer XLT`, `Explorer Limited`, `F-150 Fortaleza`, `F-150 FX4`, `F-350 Tritón`, `Super Duty F-250 / F-350`, `Cargo 815`, `Cargo 1721`, etc.
    - **United Motors (UM):** Agregada la `Xtreet 250`, junto a `Max 150`, `Renegade 200`, `Fastwind 220`, `Matrix 150`, `Powermax 150` y `Nitrox 150`.
    - **Bera & Empire Keeway:** Opciones desglosadas por cilindrada y chasis (`Horse 150 I`, `Horse 150 II`, `Owen 150`, `Arsen II 150`, `TX 200`, `Outlook 150`, `SBR 150`, `Leon 150`, `DT 200`, `Kavak 150`, `Merú 150`, `Bws 150`, `Scrambler 250`).
- **Base de Datos Sincronizada:**
  - Se repoblaron los 262 registros en PostgreSQL de forma limpia e indexada por marca.

---

## [1.20.0] - 2026-10-29

### Plantilla Maestra de Modelos por Marca Automotriz Comunes en Venezuela

#### Agregado
- **Catálogo Maestro de Modelos Venezolanos ([`catalogoModelos.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/lib/catalogoModelos.ts)):**
  - Implementación de 214 modelos automotrices más frecuentes en el parque vehicular venezolano vinculados directamente a cada marca registrada.
  - Ejemplos precargados:
    - *Chevrolet:* Aveo, Optra, Corsa, Spark, Cruze, Silverado, Grand Vitara, Luv D-Max, Tahoe, Trailblazer, Cheyenne, Astra, Cavalier, Blazer, etc.
    - *Toyota:* Corolla, Hilux, Yaris, Fortuner, 4Runner, Land Cruiser (Machito / Samurai), Prado (Merú), Terios, Tacoma, Tundra, Camry, RAV4, Dyna.
    - *Ford:* Fiesta, Focus, Fusion, Explorer, EcoSport, F-150 (Fortaleza / FX4), F-350 (Tritón), Super Duty, Ranger, Ka, Escape, Laser.
    - *Bera:* Leon 150, SBR 150, DT 200, Kavak 150, Runner 150, Merú 150, Corvette 150, BR 200, Mustang 150.
    - *Empire Keeway:* Horse 150, Owen 150, Arsen II 150, TX 200, Outlook 150, Speed 200, RK6 600.
    - *Hyundai, Kia, Renault, Nissan, Mitsubishi, Fiat, Jeep, Chery, Volkswagen, Mazda, Honda, Suzuki, Jac, Dodge, etc.*
- **Poblado Idempotente en PostgreSQL:**
  - Se ejecutó el script de inserción en base de datos registrando los 214 modelos en `opciones_catalogo` bajo categorias aisladas por marca (`MODELO_CHEVROLET`, `MODELO_TOYOTA`, etc.).
- **Sub-pestaña de Plantillas en Configuración ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - Cuarta tarjeta de plantilla: **Modelos por Marca**.
  - Selector dinámico de marca con acceso rápido por botones en 1 toque.
  - Buscador reactivo de modelos por texto dentro de la marca activa.
  - Formulario para agregar nuevos modelos a cualquier marca y botón de eliminación individual con confirmación.
- **Formulario Inteligente de Registro de Vehículos ([`src/app/vehiculos/nuevo/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/vehiculos/nuevo/page.tsx)):**
  - Al seleccionar o cambiar la marca automotriz, se consultan reactivamente sus modelos asociados.
  - Campo de modelo equipado con `<datalist>` nativo para autocompletar al escribir.
  - Botones de selección rápida (*chips*) con los modelos más comunes de la marca seleccionada para cargar con un solo clic.
  - Modal incorporado `+ Otro modelo` para registrar nuevos modelos a la plantilla de esa marca en caliente sin abandonar el formulario.
- **Endpoints de Catálogo Actualizados ([`route.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/catalogos/route.ts)):**
  - Soporte de filtrado por `marca` y búsqueda global con `MODELOS_TODOS`.

---

## [1.19.3] - 2026-10-29

### Cabecera Superior Fija Anclada (Sticky Header) para Modo Responsivo y Escritorio

#### Agregado
- **Barra Superior Anclada en Tiempo Real ([`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx)):**
  - Implementado posicionamiento `sticky top-0 z-30` con fondo translúcido y desenfoque óptico (`backdrop-blur-md`).
  - El botón de menú tipo hamburguesa (tres rayitas), la campana de notificaciones y el perfil de usuario se mantienen accesibles en todo momento sin importar la profundidad del desplazamiento vertical de la página.
  - Soporte integrado en [`globals.css`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/globals.css) para mantener la transparencia calibrada en modo claro (`bg-white/95`) y modo oscuro (`rgba(15, 23, 42, 0.94)` con `backdrop-filter: blur(12px)`).

---

## [1.19.2] - 2026-10-29

### Refinamiento Estético del Menú Lateral y Drawer Móvil con Paletas Ingenieriles

#### Mejorado
- **Diseño Ergonómico de la Barra de Menú y Drawer Móvil:**
  - Se eliminó la inundación de color plano que sobresaturaba la superficie del menú lateral en pantallas móviles y escritorio (donde fondos enteros se pintaban de naranja o verde sólido al elegir ámbar o esmeralda).
  - La superficie base del menú (`.sidebar-surface`) ahora conserva un fondo ultra oscuro neutro de alta gama (`#0b0f19` a `#04120e` según el matiz), con bordes sutiles y widget de tasas integrado.
  - La paleta seleccionada se enfoca con precisión quirúrgica en los acentos de la interfaz:
    - **Píldora Activa (`.sidebar-nav-active`):** Fondo translúcido tenue con brillo sutil y borde izquierdo indicador de 3px en el tono seleccionado (azul cielo, esmeralda, ámbar, cobalto o titanio).
    - **Íconos de Navegación Activos (`.sidebar-nav-icon`):** Tono brillante a juego con la paleta.
    - **Insignia del Logo (`.sidebar-brand-badge`):** Borde y fondo translúcido a juego con la identidad gráfica seleccionada.
    - **Títulos de Sección (`.sidebar-section-title`):** Resaltado tipográfico sobrio.
    - **Botones Primarios de Acción:** Integrados armónicamente con los tonos de la paleta.

---

## [1.19.1] - 2026-10-29

### Motor de Estilos Globales para Modo Oscuro y Paletas de Colores de Ingenieria

#### Agregado
- **Habilitacion de Modo Oscuro en Tailwind (`darkMode: 'class'`):**
  - Configurado en [`tailwind.config.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/tailwind.config.ts) para permitir transiciones instantaneas de tema basadas en clases.
- **Hojas de Estilo de Paletas en [`src/app/globals.css`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/globals.css):**
  - Implementadas reglas CSS reactivas para los selectores de atributo `[data-palette="slate"]`, `[data-palette="zinc"]`, `[data-palette="emerald"]`, `[data-palette="amber"]` e `[data-palette="indigo"]`.
  - Los componentes clave (Barra lateral `aside`, botones primarios, estados hover y badges) ahora cambian de color en tiempo real al seleccionar cualquier paleta.
  - Implementadas reglas integrales para `html.dark` y `[data-theme="dark"]`: inversion de fondos de aplicacion (`#080d16`), tarjetas (`#0f172a`), cabecera, inputs, selectores y tablas con alto contraste.
- **Script Antidestello (*Zero-Flash Script*) en [`RootLayout`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/layout.tsx):**
  - Inyecta de forma sincronizada el tema y la paleta preferidos desde `localStorage` antes del primer renderizado para evitar parpadeos visuales al recargar.

---

## [1.19.0] - 2026-10-29

### Reestructuracion del Modulo de Configuracion con Sub-pestanas: Plantillas, Apariencia y Gestion de Usuarios con Roles

#### Agregado
- **Arquitectura de Sub-pestanas en Configuracion ([`ConfiguracionClient.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/configuracion/ConfiguracionClient.tsx)):**
  - **Pestana 1 - Plantillas y Menus:** Administracion dinamica de opciones desplegables (*Marcas Automotrices*, *Tipos de Vehiculo* y *Tipos de Servicio Mecanico*).
  - **Pestana 2 - Apariencia y Tema:**
    - Selector de Modo: **Modo Claro**, **Modo Oscuro** y **Automatico (Sistema)** con persistencia en `localStorage`.
    - 5 Paletas de Colores de Ingenieria: *Azul Acero Naval (Slate)*, *Gris Titanio Industrial (Zinc)*, *Verde Esmeralda Tecnico*, *Ambar Pit-Stop Mecanico* y *Cobalto de Precision (Indigo)*.
    - Cuadro de demostracion interactiva en vivo con botones y badges.
    - Contexto global [`ThemeContext.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/context/ThemeContext.tsx) integrado en [`RootLayout`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/layout.tsx).
  - **Pestana 3 - Roles y Gestion de Usuarios:**
    - Modelo `Usuario` y enum `RolUsuario` (`ADMINISTRADOR`, `SUPERVISOR`, `MECANICO_OPERADOR`, `CLIENTE`) implementados en PostgreSQL ([`prisma/schema.prisma`](file:///c:/Desarrollo/ProgramaMantenimiento/prisma/schema.prisma)).
    - Soporte para cuentas exclusivas de portal de clientes vinculadas a un titular (`clienteId`).
    - API REST completa en [`/api/usuarios`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/usuarios/route.ts) con soporte para `GET`, `POST`, `PATCH` y `DELETE`.
    - **Modal de Restablecimiento de Clave:** Permite a administradores y supervisores asignar una nueva contraseña a cualquier usuario en tiempo real sin salir del panel.
    - Modal de confirmacion de eliminacion de usuario.

---

## [1.18.0] - 2026-10-29

### Vista Movil con Tarjetas Nativas y Dashboard Compacto

#### Agregado
- **Modo Tarjeta Nativo para Dispositivos Moviles:**
  - En lugar de forzar tablas de 7 columnas con scroll horizontal en celulares, se incorporo una vista de tarjetas compactas nativas para pantallas `< 768px` en:
    - **Cronograma de Mantenimientos ([`MaintenanceTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/mantenimientos/MaintenanceTable.tsx)):** Tarjetas con ID de orden, estado, fecha, marca y modelo del vehiculo, titular, descripcion tecnica, tags de odometro y costos duales ($ / Bs.), y botones de accion accesibles al pulgar (*thumb-friendly*).
    - **Padron de Vehiculos ([`VehicleTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/vehiculos/VehicleTable.tsx)):** Tarjetas con datos del vehiculo, titular vinculado, placa y enlace directo para programar servicio.
    - **Directorio de Clientes ([`ClientTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/clientes/ClientTable.tsx)):** Tarjetas con nombre, documento/persona natural, datos de contacto y acceso a ficha tecnica.
  - La vista clasica de tabla corporativa completa permanece activa automaticamente en pantallas de escritorio (`>= 768px`).
- **Dashboard Principal Compacto ([`src/app/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/page.tsx)):**
  - Cuadricula de 4 metricas KPI reorganizada en un grid 2x2 en celulares (`grid-cols-2`), reduciendo en un 50% la altura de scroll vertical requerida.
  - Reestructuracion de cabeceras de seccion con distribucion fluida (*stacked*) para evitar desbordes o textos cortados entre titulos y botones de accion.

---

## [1.17.1] - 2026-10-28

### Resolucion de Error de Hidratacion SSR en Dispositivos Moviles

#### Corregido
- **Error de Hidratacion React (`react-hydration-error`):**
  - **Causa:** El uso de `Number.prototype.toLocaleString()` en el servidor Node.js (con configuracion regional de sistema con punto decimal `12.000`) discrepaba del navegador del telefono celular (con configuracion regional en ingles o sistema de coma `12,000`), provocando la incompatibilidad de texto `Server: "12.000" Client: "12,000"`.
  - **Solucion:**
    - Creados formateadores numericos deterministas en [`src/lib/utils.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/lib/utils.ts): `formatKilometraje`, `formatBolivares` y `formatFechaCorta`, los cuales garantizan una salida identica caracter por caracter en servidor y cliente sin depender de la configuracion regional del dispositivo.
    - Aplicada la propiedad `suppressHydrationWarning` en los nodos de texto de fechas, kilometraje y montos en [`MaintenanceTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/mantenimientos/MaintenanceTable.tsx), [`RatesWidget.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/RatesWidget.tsx) y [`ClienteDetallePage`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/clientes/[id]/page.tsx).

---

## [1.17.0] - 2026-10-28

### Diseno Web Responsivo Integral (Mobile, Tablet y Desktop)

#### Agregado
- **Navegacion Movil con Drawer Deslizante y Backdrop:**
  - Incorporado estado reactivo `isMobileOpen`, `toggleMobileSidebar` y `closeMobileSidebar` en el contexto global [`SidebarContext.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/context/SidebarContext.tsx).
  - Implementado drawer lateral deslizante en [`Sidebar.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Sidebar.tsx) para pantallas moviles y tablets (`< 768px`) con desenfoque de fondo (*backdrop blur*), cierre automatico al seleccionar cualquier modulo y boton de cierre rapido.
  - El sidebar de escritorio mantiene su comportamiento plegable ultra compacto a partir del breakpoint `md:`.
  - El widget de tasas de cambio (`USD BCV`, `EUR BCV`, `USDT`) se adapta fluidamente en el drawer movil.
- **Header Responsivo con Boton Hamburguesa:**
  - Agregado boton de activacion de menu hamburguesa en [`Header.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/layout/Header.tsx) exclusivo para dispositivos moviles.
  - Adaptacion de paddings (`px-4 sm:px-6 lg:px-8`) y comportamiento reactivo de la barra de busqueda y perfil para evitar desbordamientos horizontales.
- **Adaptacion de Contenedores y Tablas en Todas las Vistas:**
  - Ajustados los margenes de las vistas principales y formularios (`p-4 sm:p-6 lg:p-8`) en [`page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/page.tsx), [`clientes/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/clientes/page.tsx), [`vehiculos/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/vehiculos/page.tsx), [`mantenimientos/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/mantenimientos/page.tsx), [`configuracion/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/configuracion/page.tsx) y formularios de alta.
  - Barra de busqueda responsive (`w-full sm:w-80`) y alineacion de contadores en [`ClientTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/clientes/ClientTable.tsx), [`VehicleTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/vehiculos/VehicleTable.tsx) y [`MaintenanceTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/mantenimientos/MaintenanceTable.tsx).

---

## [1.16.0] - 2026-10-28

### Sistema de Costos Dual (USD / Bs.) con Conversion a Tasa del Dia

#### Agregado
- Campos `costoManoObraBs` y `tasaCambio` en la entidad `Mantenimiento` en PostgreSQL ([`prisma/schema.prisma`](file:///c:/Desarrollo/ProgramaMantenimiento/prisma/schema.prisma)) y en las interfaces TypeScript ([`src/types/index.ts`](file:///c:/Desarrollo/ProgramaMantenimiento/src/types/index.ts)).
- Calculadora de conversion bidireccional en tiempo real ($ <-> Bs.) tanto en la creacion de ordenes ([`src/app/mantenimientos/nuevo/page.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/mantenimientos/nuevo/page.tsx)) como en la edicion o carga posterior en el cronograma ([`src/components/mantenimientos/MaintenanceTable.tsx`](file:///c:/Desarrollo/ProgramaMantenimiento/src/components/mantenimientos/MaintenanceTable.tsx)):
  - Al ingresar el monto en **$ (USD)**, se calcula y rellena automaticamente el equivalente en **Bs.** segun la tasa activa.
  - Al ingresar el monto en **Bs.**, se calcula y rellena de inmediato el equivalente en **$ (USD)** segun la tasa activa.
  - Selector rapido de cotizacion del dia: **BCV Oficial**, **USDT / Mercado** o **Tasa Personalizada/Manual**.
- Soporte completo en la API REST [`/api/mantenimientos`](file:///c:/Desarrollo/ProgramaMantenimiento/src/app/api/mantenimientos/route.ts) para recepcion y actualizacion (`POST` y `PATCH`) de montos en bolivares y la tasa cambiaria aplicada.
- Despliegue visual simultaneo en la columna de costos del cronograma de ordenes: muestra el monto en `$` y la cifra en `Bs.` (con indicacion de la tasa registrada).

---

## [1.15.0] - 2026-10-28

### Menu Desplegable de Tipo de Servicio Fijo y Detalle Opcional

#### Corregido
- Resuelto el reseteo automatico del selector de servicios en [`src/app/mantenimientos/nuevo`](src/app/mantenimientos/nuevo/page.tsx), el cual regresaba a "Insertar tipo de servicio..." al seleccionar una opcion.

#### Modificado
- El campo ahora es un menu desplegable permanente y principal: **"Tipo de Servicio Tecnico a Ejecutar *"** que mantiene visible y seleccionada la opcion elegida de la plantilla (*Cambio de Aceite y Filtros*, *Sistema de Frenos*, etc.).
- Incorporado el boton rapido **"+ Otro tipo de servicio"** para registrar nuevas categorias tecnicas al catalogo sin salir del formulario.
- Campo complementario de texto libre: **"Detalle / Observaciones Tecnicas Especificas (Opcional)"** para acotaciones tecnicas puntuales.

---

## [1.14.0] - 2026-10-28

### Estandarizacion de Clasificacion de Clientes sin Documento Fiscal

#### Modificado
- Reemplazada la etiqueta `Particular / Sin doc` por la denominacion corporativa formal **`Persona Natural`** en:
  - Ficha tecnica individual del cliente ([`src/app/clientes/[id]/page.tsx`](src/app/clientes/[id]/page.tsx)).
  - Tabla del directorio de clientes ([`src/components/clientes/ClientTable.tsx`](src/components/clientes/ClientTable.tsx)).
  - Directorio de la flota vehicular ([`src/components/vehiculos/VehicleTable.tsx`](src/components/vehiculos/VehicleTable.tsx)).

---

## [1.13.0] - 2026-10-28

### Widget de Cotizaciones Cambiarias en Barra Lateral (USD BCV, EUR BCV, USDT)

#### Agregado
- Endpoint de API REST [`/api/tasas`](src/app/api/tasas/route.ts) con sistema de cache en memoria (TTL de 10 minutos) y proteccion de fallback en caso de interrupcion de red.
- Sincronizacion simultanea de las 3 cotizaciones cambiarias clave en Venezuela:
  - **Dolar Oficial BCV (`USD BCV`)**
  - **Euro Oficial BCV (`EUR BCV`)**
  - **Dolar Mercado Libre / Cripto (`USDT`)**
- Componente interactivo [`RatesWidget.tsx`](src/components/layout/RatesWidget.tsx) integrado en el menu lateral [`Sidebar.tsx`](src/components/layout/Sidebar.tsx):
  - **Modo Expandido:** Tarjeta de diseno sobrio con valores en bolivares (VES), badges por divisa, indicador de procedencia oficial/paralelo y boton de refresco manual.
  - **Modo Plegado:** Boton compacto centrado con tooltip corporativo flotante al pasar el cursor para no perder la visualizacion de las tasas.
  - Auto-actualizacion periodica cada 15 minutos en segundo plano.

---

## [1.12.0] - 2026-10-28

### Tags de Vehiculo, Kilometraje y Parametros Financieros con Garantia

#### Agregado
- **Tag / Tipo de Vehiculo (`Carro`, `Moto`, `Camioneta`):**
  - Incorporado campo `tipo` en el modelo `Vehiculo` (`prisma/schema.prisma`).
  - Sembrado en catálogo dinámico `TIPO_VEHICULO` y administrable desde `/configuracion`.
  - Selector por botones en el formulario de alta de vehiculo ([`src/app/vehiculos/nuevo`](src/app/vehiculos/nuevo/page.tsx)).
  - Columna y badge de clasificacion en [`VehicleTable.tsx`](src/components/vehiculos/VehicleTable.tsx) y en la ficha tecnica del cliente.
- **Kilometraje y Parametros Financieros en Mantenimiento:**
  - Nuevos campos en `Mantenimiento`: `kilometraje` (km), `horasHombre` (horas invertidas), `costoManoObra` ($) y `esGarantia` (checkbox booleano).
  - Formulario ([`src/app/mantenimientos/nuevo`](src/app/mantenimientos/nuevo/page.tsx)) enriquecido con campo de lectura de odometro y tarjeta de parametros financieros opcionales.
  - Tabla de Mantenimientos ([`MaintenanceTable.tsx`](src/components/mantenimientos/MaintenanceTable.tsx)) con badges de odometro (`km`), distintivo ambar `Garantia`, horas hombre y costo de mano de obra.

---

## [1.11.0] - 2026-10-28

### Modulo de Configuracion y Plantillas Dinamicas de Menus Desplegables

#### Agregado
- Modelo de datos relacional `OpcionCatalogo` (`prisma/schema.prisma`) para la administracion unificada y persistente de opciones de menus desplegables y plantillas maestras.
- Endpoint de API REST `GET`, `POST`, `DELETE` en [`/api/catalogos`](src/app/api/catalogos/route.ts) con control de duplicados y reactivacion automatica.
- Precarga (Seed) inicial de las **21 marcas automotrices oficiales**: Chevrolet, Ford, Hyundai, Toyota, Honda, Geely global, Chery, Fiat, Renault, Daihatsu, Suzuki, Bera, United Motors, Jac, Mitsubishi, Kia, Peugeot, Dodge, Jeep, Volkswagen, Mazda.
- Precarga inicial de **9 tipos de servicios tecnicos** para ordenes de mantenimiento.
- Modulo integral de **Configuracion** ([`src/app/configuracion/page.tsx`](src/app/configuracion/page.tsx) y [`ConfiguracionClient.tsx`](src/components/configuracion/ConfiguracionClient.tsx)): interfaz para visualizar, agregar y eliminar opciones de cada plantilla.
- Formulario de Vehiculos ([`src/app/vehiculos/nuevo`](src/app/vehiculos/nuevo/page.tsx)): El campo "Marca Automotriz" ahora es un menu desplegable sincronizado con la plantilla, con boton emergente para agregar nuevas marcas al vuelo sin salir de la vista.
- Formulario de Mantenimientos ([`src/app/mantenimientos/nuevo`](src/app/mantenimientos/nuevo/page.tsx)): Selector de plantillas de servicio rapidas para auto-rellenar la descripcion tecnica.

---

## [1.10.0] - 2026-10-28

### Desvinculacion de Requisito de Placa y Enfoque en Titularidad de Cliente

#### Modificado
- Esquema de base de datos Prisma (`prisma/schema.prisma`): Campo `placa` convertido en opcional (`String?`) y retirada la restriccion obligatoria `@unique`.
- Formulario de alta vehicular ([`src/app/vehiculos/nuevo/page.tsx`](src/app/vehiculos/nuevo/page.tsx)): Eliminado el campo "Placa / Matricula *". Ahora la diferenciacion principal de la unidad radica en el **Cliente Titular Asociado**, seguido de Marca, Modelo y Año.
- Endpoint de API REST ([`src/app/api/vehiculos/route.ts`](src/app/api/vehiculos/route.ts)): Removida la validacion de obligatoriedad para la placa vehicular.
- Tablas y Vistas ([`VehicleTable.tsx`](src/components/vehiculos/VehicleTable.tsx), [`MaintenanceTable.tsx`](src/components/mantenimientos/MaintenanceTable.tsx), [`clientes/[id]/page.tsx`](src/app/clientes/[id]/page.tsx)): Reestructuradas para priorizar el nombre y documento del cliente asociado junto con las especificaciones del vehiculo (Marca, Modelo, Año).
- Formulario de Mantenimiento ([`src/app/mantenimientos/nuevo/page.tsx`](src/app/mantenimientos/nuevo/page.tsx)): Selector de vehiculo actualizado para listar `[Cliente] - Marca Modelo (Año)`.

---

## [1.9.0] - 2026-10-28

### Purga Total de Datos de Demostracion (Mock Data) y Conectividad End-to-End

#### Eliminado
- Remocion completa de todas las matrices y registros de ejemplo estaticos (`vehiculosEjemplo`, `mantenimientosEjemplo`, `clientesEjemplo`) en todas las vistas y componentes del sistema.
- Remocion de fallbacks estaticos en formularios de creacion de vehiculos y ordenes.

#### Agregado
- Dashboard ([`src/app/page.tsx`](src/app/page.tsx)): Metricas KPI (`Flota Registrada`, `Mantenimientos Pendientes`, `Servicios en Proceso`, `Completados`) y tablas en vivo calculadas directamente desde PostgreSQL con consultas agregadas de Prisma.
- Modulo de Flota ([`src/app/vehiculos/page.tsx`](src/app/vehiculos/page.tsx)): Directorio vehicular alimentado al 100% por la base de datos real, con buscador reactivo y boton de eliminacion con confirmacion modal (`DELETE /api/vehiculos`).
- Modulo de Mantenimientos ([`src/app/mantenimientos/page.tsx`](src/app/mantenimientos/page.tsx)): Cronograma conectado a PostgreSQL, con selector interactivo rapido de cambio de estado (`PATCH /api/mantenimientos`) y eliminacion de ordenes (`DELETE /api/mantenimientos`).

---

## [1.8.0] - 2026-10-28

### Sincronizacion Reactiva de Clientes y Eliminacion Segura en Cascada

#### Agregado
- Endpoint API REST `DELETE /api/clientes` para borrado de clientes con remocion en cascada (`Cascade`) de flotas y mantenimientos vinculados.
- Componente interactivo [`ClientTable.tsx`](src/components/clientes/ClientTable.tsx) con buscador en tiempo real y boton de accion rapida "Eliminar".
- Modal de confirmacion con advertencia de impacto y eliminacion definitiva para prevenir borrados accidentales.
- Componente [`DeleteClientButton.tsx`](src/components/clientes/DeleteClientButton.tsx) integrado en la ficha tecnica del cliente (`/clientes/[id]`).

#### Corregido
- Vista de directorio [`/clientes`](src/app/clientes/page.tsx) actualizada para consultar directamente la base de datos PostgreSQL via Prisma en tiempo real (`force-dynamic`), eliminando la lista estatica previa que impedia visualizar a los clientes recien creados.
- Ficha de cliente [`/clientes/[id]`](src/app/clientes/[id]/page.tsx) conectada a la base de datos real con resolucion dinamica `findUnique`.

---

## [1.7.0] - 2026-10-28

### Integracion de PostgreSQL Local Portable y Resolucion de Persistencia

#### Agregado
- Despliegue de entorno PostgreSQL 16 Portable en `C:\Desarrollo\pgsql` sin requerir elevacion UAC de Administrador en Windows.
- Creacion y aprovisionamiento de la base de datos `mantenimiento_db` en `127.0.0.1:5432`.
- Scripts de operacion rapida `scripts/pg-start.bat` / `scripts/pg-start.ps1` y `scripts/pg-stop.bat` / `scripts/pg-stop.ps1`.
- Sincronizacion de esquema declarativo Prisma DDL (`npx prisma db push`).
- Manejo de excepciones enriquecido en endpoints REST (`/api/clientes`, `/api/vehiculos`, `/api/mantenimientos`) para reportar explicitamente fallos de conectividad de base de datos (codigo P1001).

#### Corregido
- Error de rechazo de conexion al intentar guardar registros en los formularios de la aplicacion.

---

## [1.6.0] - 2026-10-28

### Migracion de Entorno de Trabajo Fuera de OneDrive

#### Agregado
- Reubicacion integral del codigo base a la ruta raiz local de alto rendimiento: `C:\Desarrollo\ProgramaMantenimiento`.
- Eliminacion del overhead y latencia de bloqueo de disco provocado por el escaneo continuo de Microsoft OneDrive sobre `.next` y `node_modules`.
- Verificacion de compilacion exitosa y generacion de Prisma Client de 296ms en la nueva ubicacion.

---

## [1.5.0] - 2026-10-28

### Optimizacion de Rendimiento de Compilacion y Entorno de Desarrollo (Turbopack)

#### Agregado
- Integracion del motor Turbopack nativo de Rust (`next dev --turbo`) como script predeterminado para acelerar de 5x a 10x el arranque en caliente y el Hot Module Replacement (HMR).
- Script alternativo `"dev:webpack"` para ejecucion mediante bundler clasico si fuese requerido.
- Desactivacion de telemetria en tiempo real de Next.js (`NEXT_TELEMETRY_DISABLED=1`) para eliminar latencias de red en el arranque local.
- Optimizacion granular en `next.config.mjs` mediante `optimizePackageImports: ["lucide-react"]` para evitar la carga en memoria de miles de iconos no utilizados.

#### Modificado
- Reduccion de I/O de consola en `src/lib/prisma.ts` desactivando el registro excesivo de sentencias SQL en stdout durante el modo de desarrollo.
- Actualizacion de scripts de inicio rápido (`dev.bat` y `dev.ps1`) para fijar variables de aceleracion antes de invocar el servidor.

---

## [1.4.0] - 2026-10-28

### Flexibilizacion de Identificacion Fiscal para Clientes

#### Modificado
- Esquema de base de datos Prisma (`prisma/schema.prisma`): El campo `documentoIdentidad` en el modelo `Cliente` pasa a ser opcional (`String?`) y se retira la restriccion estricta `@unique` para permitir el registro de clientes particulares o de uso interno sin identificador fiscal.
- Endpoint de API REST (`src/app/api/clientes/route.ts`): La validacion de entrada ahora solo exige el nombre o razon social del cliente.
- Formulario de creacion (`src/app/clientes/nuevo/page.tsx`): Se elimina el asterisco obligatorio y la validacion `required` en el campo de identificacion fiscal, etiquetandolo como `(Opcional)`.
- Componentes visuales (`VehicleTable.tsx`, `clientes/page.tsx`, `clientes/[id]/page.tsx`): Adaptacion de tablas y fichas para mostrar indicadores discretos (`Particular / Sin doc`) en caso de registros sin documento fiscal.

---

## [1.3.0] - 2026-10-28

### Modulos de Registro y Correccion de Enrutamiento 404

#### Agregado
- Formulario de alta para clientes en `src/app/clientes/nuevo/page.tsx` con validaciones de campos fiscales, telefono y correo electronico.
- Endpoint de API REST serverless en `src/app/api/clientes/route.ts` para operaciones GET y POST con control de unicidad de documento e identificador fiscal.
- Formulario de registro para flota vehicular en `src/app/vehiculos/nuevo/page.tsx` con vinculacion selectiva de titulares comerciales.
- Formulario de programacion de intervenciones tecnicas en `src/app/mantenimientos/nuevo/page.tsx` con seleccion de vehiculo, cronograma y clasificacion de estado.
- Vista de detalle y ficha tecnica de cliente en `src/app/clientes/[id]/page.tsx` para visualizacion de unidades asociadas.

#### Corregido
- Enlace huérfano `/clientes/nuevo` que ocasionaba un error 404 al intentar registrar un nuevo cliente desde la vista de directorio.
- Enlaces de creacion en modulos de vehiculos y mantenimientos conectados a sus correspondientes vistas de formulario.

---

## [1.2.0] - 2026-10-28

### Menu Lateral Plegable Dinamico (Collapsible Sidebar)

#### Agregado
- Boton de tres rayitas (icono SVG `Menu`) en la cabecera del menu lateral para alternar entre modo expandido y modo plegado.
- Contexto de estado global `SidebarContext` (`src/context/SidebarContext.tsx`) con persistencia automatica de la preferencia del usuario en `localStorage`.
- Transicion CSS fluida (`duration-300 ease-in-out`) entre el ancho expandido (`w-64`) y el ancho compacto (`w-16`).
- Sistema de tooltips corporativos flotantes en el estado plegado para preservar la identificacion inmediata de cada modulo.
- Minimizacion del pie de estado del sistema (indicador de pulso de red operativo en modo compacto).

---

## [1.1.0] - 2026-10-28

### Suite de Scripts de Automatizacion y Ejecucion Operativa

#### Agregado
- Directorio de automatizacion operativa `scripts/` con soporte dual para entornos Batch (`.bat`) y PowerShell (`.ps1`).
- Script de inicializacion y preparacion completa (`setup.bat` / `setup.ps1`) para instalacion de dependencias, sincronizacion de entorno y generacion de Prisma Client.
- Script de ejecucion de entorno de desarrollo (`dev.bat` / `dev.ps1`) con verificacion preventiva de archivos de entorno y modulos.
- Script de compilacion y control de calidad (`build.bat` / `build.ps1`) para ejecucion de builds de produccion.
- Script de migracion de esquema de base de datos (`db-migrate.bat` / `db-migrate.ps1`) para aplicacion de cambios DDL en PostgreSQL.
- Script de consola grafica de datos (`db-studio.bat` / `db-studio.ps1`) para ejecucion rapida de Prisma Studio en navegador.
- Documento de referencia de comandos y ejecucion operativa en `scripts/README.md`.

---

## [1.0.0] - 2026-10-28

### Inicializacion de Arquitectura y Base del Sistema

#### Agregado
- Estructura base del proyecto sobre Next.js 14 (App Router) y TypeScript con soporte estricto de tipos.
- Configuracion de Tailwind CSS personalizada con paleta de ingenieria (Slate, Dark Navy Blue, fondos neutrales de baja saturacion).
- Esquema de base de datos relacional en Prisma (`prisma/schema.prisma`) con los modelos `Cliente`, `Vehiculo` y `Mantenimiento`.
- Configuracion de conexion dual para PostgreSQL (Neon / Supabase) con soporte de Connection Pooling (`DATABASE_URL`) y migraciones directas (`DIRECT_URL`).
- Singleton de Prisma Client en `src/lib/prisma.ts` para prevenir agotamiento de conexiones en entornos Serverless de Vercel.
- Barra de navegacion lateral permanente (`Sidebar.tsx`) con rutas funcionales a los modulos principales: Panel de Control, Clientes, Vehiculos, Mantenimientos, Reportes y Configuracion.
- Barra superior de estado y perfil (`Header.tsx`) con buscador corporativo y accesos rapidos.
- Componente de insignia de estado (`Badge.tsx`) para la clasificacion de ordenes: `PENDIENTE`, `EN_PROCESO` y `COMPLETADO`.
- Componente de tabla de vehiculos (`VehicleTable.tsx`) con vista de placas en monoespacio, cliente asociado, conteo de servicios y acciones tecnicas.
- Componente de tabla de mantenimientos (`MaintenanceTable.tsx`) con codigo de orden, fecha programada, detalle de servicio y estado operativo.
- Vista principal del Centro de Control (`src/app/page.tsx`) con tarjetas de metricas cuantitativas (KPIs) y tablas consolidadas de datos.
- Modulos de navegacion individuales en `src/app/vehiculos`, `src/app/mantenimientos` y `src/app/clientes`.
- Rutas de API REST serverless preparadas en `src/app/api/vehiculos` y `src/app/api/mantenimientos` para operaciones de consulta y creacion.
- Documento maestro de arquitectura tecnica (`ARCHITECTURE.md`) con diagramas Mermaid ERD y de flujo de capas.
- Registro historico de cambios (`CHANGELOG.md`).
- Guia de inicio y despliegue en Vercel (`README.md`).

#### Restricciones Cumplidas
- Ausencia total de emojis en interfaces graficas, textos, codigo fuente, comentarios y documentacion markdown.
- Cumplimiento de paleta visual sobria con colores de ingenieria.

---

## [Plantilla para Versiones Futuras]

### [X.Y.Z] - AAAA-MM-DD
#### Agregado
- Nuevas caracteristicas implementadas.

#### Modificado
- Cambios en funcionalidades existentes.

#### Corregido
- Correccion de errores o fallas tecnicas.

#### Seguridad
- Mejoras o parches de vulnerabilidades.

