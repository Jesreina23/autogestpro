"use client";

import { useState } from "react";
import {
  Layers,
  Palette,
  Users,
  Plus,
  Trash2,
  Tag,
  Wrench,
  Car,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Moon,
  Sun,
  Monitor,
  ShieldCheck,
  KeyRound,
  User,
  Mail,
  Lock,
  Eye,
  Check,
  RefreshCw,
  Search,
  Shield,
  FileText,
  Ban,
  Info,
  Save,
  RotateCcw,
} from "lucide-react";
import { useTheme, ThemeMode, ThemePalette } from "@/context/ThemeContext";
import { Usuario, RolUsuario, NivelPermiso, PermisoRolItem } from "@/types";
import { getCategoriaModelo } from "@/lib/catalogoModelos";
import { MODULOS_SISTEMA, PERMISOS_DEFAULT } from "@/lib/permisosDefaults";

export interface OpcionItem {
  id: string;
  categoria: string;
  valor: string;
  orden: number;
  activo: boolean;
}

interface ClienteOpcion {
  id: string;
  nombre: string;
  documentoIdentidad?: string | null;
}

interface ConfiguracionClientProps {
  initialOpciones: OpcionItem[];
  initialUsuarios: Usuario[];
  clientes: ClienteOpcion[];
  initialPermisos?: PermisoRolItem[];
}

const CATEGORIAS_PLANTILLA = [
  {
    id: "MARCA_VEHICULO",
    nombre: "Marcas Automotrices",
    descripcion: "Opciones disponibles en el menu desplegable de Marca al registrar un vehiculo",
    icon: Car,
    placeholder: "Ej. BYD, Foton, Isuzu...",
  },
  {
    id: "MODELO_VEHICULO",
    nombre: "Modelos por Marca",
    descripcion: "Modelos comunes del parque automotor venezolano clasificados por marca (Aveo, Hilux, Fiesta...)",
    icon: Layers,
    placeholder: "Ej. Aveo, Optra, Hilux, Fortuner, Fiesta...",
  },
  {
    id: "TIPO_VEHICULO",
    nombre: "Tipos de Vehiculo (Tags)",
    descripcion: "Clasificacion de unidades automotrices: Carro, Moto, Camioneta, etc.",
    icon: Tag,
    placeholder: "Ej. Camion, Autobus, Maquinaria Pesada...",
  },
  {
    id: "TIPO_SERVICIO",
    nombre: "Tipos de Servicio Mecanico",
    descripcion: "Plantillas predefinidas para la descripcion de servicios en ordenes de mantenimiento",
    icon: Wrench,
    placeholder: "Ej. Calibracion de Valvulas, Limpieza de Inyectores...",
  },
];

const PALETAS: {
  id: ThemePalette;
  nombre: string;
  descripcion: string;
  colorPreview: string;
  badgeClass: string;
}[] = [
  {
    id: "slate",
    nombre: "Azul Acero Naval (Slate)",
    descripcion: "Paleta corporativa formal de ingenieria y aeronautica.",
    colorPreview: "bg-slate-900 border-slate-700",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
  {
    id: "zinc",
    nombre: "Gris Titanio Industrial (Zinc)",
    descripcion: "Tono metalico neutro de maxima precision mecanica.",
    colorPreview: "bg-zinc-800 border-zinc-600",
    badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-300",
  },
  {
    id: "emerald",
    nombre: "Verde Esmeralda Tecnico",
    descripcion: "Orientado a inspeccion aprobada, calidad y control de fallas.",
    colorPreview: "bg-emerald-800 border-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "amber",
    nombre: "Ambar Pit-Stop Mecanico",
    descripcion: "Inspirado en talleres automotrices, bahias de servicio y advertencias.",
    colorPreview: "bg-amber-600 border-amber-500",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "indigo",
    nombre: "Cobalto de Precision (Indigo)",
    descripcion: "Estilo tecnologico moderno para telemetria y flotas conectadas.",
    colorPreview: "bg-indigo-900 border-indigo-700",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
];

const ROLES_INFO: Record<
  RolUsuario,
  {
    label: string;
    badgeClass: string;
    desc: string;
    responsabilidad: string;
    colorBorde: string;
    colorBg: string;
  }
> = {
  ADMINISTRADOR: {
    label: "Administrador",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
    desc: "Acceso total a la plataforma, configuración global, gestión y auditoría.",
    responsabilidad: "Control absoluto de usuarios, catálogos maestros y seguridad.",
    colorBorde: "border-rose-200",
    colorBg: "bg-rose-50/40",
  },
  SUPERVISOR: {
    label: "Supervisor de Taller",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    desc: "Control del taller, asignación de tareas, costeo y cronogramas de servicio.",
    responsabilidad: "Aprobación de órdenes, fijación de tarifas y control de flota.",
    colorBorde: "border-sky-200",
    colorBg: "bg-sky-50/40",
  },
  MECANICO_OPERADOR: {
    label: "Mecánico / Operador",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "Ejecución de trabajos en bahía técnica y reporte de avances operativos.",
    responsabilidad: "Carga de horas-hombre, odómetros, diagnósticos y estado.",
    colorBorde: "border-emerald-200",
    colorBg: "bg-emerald-50/40",
  },
  CLIENTE: {
    label: "Usuario Cliente (Portal)",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    desc: "Acceso exclusivo para titulares al seguimiento de sus propios vehículos.",
    responsabilidad: "Consulta de órdenes propias, historial técnico y presupuestos.",
    colorBorde: "border-purple-200",
    colorBg: "bg-purple-50/40",
  },
};

interface NivelPermisoInfo {
  nivel: "TOTAL" | "OPERACION" | "CONSULTA" | "NINGUNO";
  texto: string;
  detalle: string;
}

interface ModuloPermisoItem {
  id: string;
  apartado: string;
  descripcion: string;
  permisos: Record<RolUsuario, NivelPermisoInfo>;
}

const MATRIZ_PERMISOS: ModuloPermisoItem[] = [
  {
    id: "dashboard",
    apartado: "Panel de Control (Dashboard)",
    descripcion: "Métricas generales del taller, estado de la flota, alertas urgentes y cotizaciones",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Indicadores financieros, órdenes en curso y estado global del taller.",
      },
      SUPERVISOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Supervisión del cronograma, alertas de vencimiento y órdenes activas.",
      },
      MECANICO_OPERADOR: {
        nivel: "CONSULTA",
        texto: "Solo Lectura",
        detalle: "Visualización de órdenes de mantenimiento en bahía técnica.",
      },
      CLIENTE: {
        nivel: "NINGUNO",
        texto: "Sin Acceso",
        detalle: "No disponible para clientes; redirige a su portal de vehículos.",
      },
    },
  },
  {
    id: "clientes",
    apartado: "Gestión de Clientes",
    descripcion: "Fichas de clientes, datos de contacto, documentos de identidad y generación de accesos",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Crear, editar, eliminar titulares y generar usuarios del portal.",
      },
      SUPERVISOR: {
        nivel: "OPERACION",
        texto: "Operación",
        detalle: "Registrar nuevos clientes y actualizar datos de contacto.",
      },
      MECANICO_OPERADOR: {
        nivel: "CONSULTA",
        texto: "Solo Lectura",
        detalle: "Consulta de datos básicos para contacto técnico del vehículo.",
      },
      CLIENTE: {
        nivel: "NINGUNO",
        texto: "Sin Acceso",
        detalle: "Bloqueado por privacidad (no puede ver a otros clientes).",
      },
    },
  },
  {
    id: "vehiculos",
    apartado: "Flota y Vehículos",
    descripcion: "Registro de unidades, marcas, modelos, placas, años y odómetro actual",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Alta, edición, baja y reasignación de cualquier vehículo.",
      },
      SUPERVISOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Registro de vehículos y vinculación con sus clientes titulares.",
      },
      MECANICO_OPERADOR: {
        nivel: "OPERACION",
        texto: "Operación",
        detalle: "Actualización de kilometraje y lectura de especificaciones.",
      },
      CLIENTE: {
        nivel: "CONSULTA",
        texto: "Portal Propio",
        detalle: "Visualiza exclusivamente los vehículos registrados a su nombre.",
      },
    },
  },
  {
    id: "mantenimientos",
    apartado: "Órdenes de Mantenimiento",
    descripcion: "Programación técnica, cambio de estado (Pendiente / En Proceso / Completado) y garantías",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Apertura, reprogramación, anulación y cierre técnico de órdenes.",
      },
      SUPERVISOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Asignación de operadores, aprobación de trabajos y cierre.",
      },
      MECANICO_OPERADOR: {
        nivel: "OPERACION",
        texto: "Operación",
        detalle: "Diagnósticos, avance de estado del servicio y notas técnicas.",
      },
      CLIENTE: {
        nivel: "CONSULTA",
        texto: "Seguimiento",
        detalle: "Consulta el avance en vivo del mantenimiento de sus carros.",
      },
    },
  },
  {
    id: "finanzas",
    apartado: "Costeo de Mano de Obra y Finanzas",
    descripcion: "Registro de horas-hombre, tarifas en USD y conversión automática a bolívares (VES)",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Fijación de tarifas, cálculo de costos y márgenes de taller.",
      },
      SUPERVISOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Cálculo de horas y costeo por orden según tasa oficial BCV.",
      },
      MECANICO_OPERADOR: {
        nivel: "OPERACION",
        texto: "Horas Invertidas",
        detalle: "Carga de horas de trabajo realizadas (sin acceso a márgenes).",
      },
      CLIENTE: {
        nivel: "CONSULTA",
        texto: "Presupuesto",
        detalle: "Visualiza el monto total y desglose autorizado de su orden.",
      },
    },
  },
  {
    id: "reportes",
    apartado: "Reportes Técnicos e Historiales",
    descripcion: "Informes de fallas recurrentes, hojas de servicio técnico y certificados de entrega",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Auditoría global, estadísticas de taller y exportación.",
      },
      SUPERVISOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Generación de historiales de servicio y actas de entrega.",
      },
      MECANICO_OPERADOR: {
        nivel: "CONSULTA",
        texto: "Solo Lectura",
        detalle: "Consulta de antecedentes técnicos del carro para diagnóstico.",
      },
      CLIENTE: {
        nivel: "CONSULTA",
        texto: "Historial Propio",
        detalle: "Descarga del historial de mantenimientos hechos a su flota.",
      },
    },
  },
  {
    id: "configuracion",
    apartado: "Configuración, Catálogos y Usuarios",
    descripcion: "Catálogo de marcas/modelos, temas visuales, cuentas de usuario y contraseñas",
    permisos: {
      ADMINISTRADOR: {
        nivel: "TOTAL",
        texto: "Acceso Total",
        detalle: "Creación/baja de usuarios, cambio de roles y plantillas.",
      },
      SUPERVISOR: {
        nivel: "CONSULTA",
        texto: "Solo Lectura",
        detalle: "Consulta de catálogos y plantillas de vehículos del taller.",
      },
      MECANICO_OPERADOR: {
        nivel: "NINGUNO",
        texto: "Sin Acceso",
        detalle: "Módulo restringido para operadores mecánicos.",
      },
      CLIENTE: {
        nivel: "NINGUNO",
        texto: "Sin Acceso",
        detalle: "Módulo bloqueado para clientes (solo personal autorizado).",
      },
    },
  },
];

const NIVEL_PERMISO_CONFIG: Record<
  NivelPermiso,
  { label: string; badgeClass: string; selectClass: string; icon: any }
> = {
  TOTAL: {
    label: "Acceso Total",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    selectClass: "border-emerald-300 bg-emerald-50/80 text-emerald-950 focus:ring-emerald-500",
    icon: CheckCircle2,
  },
  OPERACION: {
    label: "Operación",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    selectClass: "border-sky-300 bg-sky-50/80 text-sky-950 focus:ring-sky-500",
    icon: Wrench,
  },
  CONSULTA: {
    label: "Solo Lectura",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    selectClass: "border-purple-300 bg-purple-50/80 text-purple-950 focus:ring-purple-500",
    icon: Eye,
  },
  NINGUNO: {
    label: "Sin Acceso",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    selectClass: "border-slate-300 bg-slate-100 text-slate-600 focus:ring-slate-400",
    icon: Ban,
  },
};

export function ConfiguracionClient({
  initialOpciones,
  initialUsuarios,
  clientes,
  initialPermisos,
}: ConfiguracionClientProps) {
  // Pestaña principal activa: 'plantillas' | 'apariencia' | 'usuarios'
  const [activeTab, setActiveTab] = useState<"plantillas" | "apariencia" | "usuarios">("plantillas");

  // Contexto de Tema y Apariencia
  const { themeMode, palette, setThemeMode, setPalette } = useTheme();

  // Estados de Plantillas y Catalogos
  const [opciones, setOpciones] = useState<OpcionItem[]>(initialOpciones);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("MARCA_VEHICULO");
  const [nuevoValor, setNuevoValor] = useState("");
  const [isLoadingOpcion, setIsLoadingOpcion] = useState(false);
  const [deletingOpcionId, setDeletingOpcionId] = useState<string | null>(null);

  // Estados de Usuarios y Roles
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isGenerandoCredenciales, setIsGenerandoCredenciales] = useState(false);
  const [userFormData, setUserFormData] = useState({
    nombre: "",
    usuario: "",
    rol: "SUPERVISOR" as RolUsuario,
    password: "admin",
    clienteId: "",
  });

  // Modal para Restablecer Clave
  const [userToResetPassword, setUserToResetPassword] = useState<Usuario | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Modal para Eliminar Usuario
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Filtro de rol para matriz de permisologia
  const [rolFiltroPermiso, setRolFiltroPermiso] = useState<RolUsuario | "TODOS">("TODOS");

  // Matriz de permisos dinamicos y editables en base de datos
  const buildInitialPermisosMap = () => {
    const map: Record<string, NivelPermiso> = {};
    const roles: RolUsuario[] = ["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"];

    // 1. Cargar defaults de fabrica
    for (const r of roles) {
      for (const m of MODULOS_SISTEMA) {
        map[`${r}_${m.id}`] = PERMISOS_DEFAULT[r]?.[m.id] || "CONSULTA";
      }
    }

    // 2. Sobrescribir con registros persistidos de PostgreSQL
    if (initialPermisos && initialPermisos.length > 0) {
      for (const p of initialPermisos) {
        map[`${p.rol}_${p.modulo}`] = p.nivel;
      }
    }

    return map;
  };

  const [permisosMap, setPermisosMap] = useState<Record<string, NivelPermiso>>(buildInitialPermisosMap);
  const [hasUnsavedPermisos, setHasUnsavedPermisos] = useState(false);
  const [isSavingPermisos, setIsSavingPermisos] = useState(false);
  const [isResettingPermisos, setIsResettingPermisos] = useState(false);

  const handleCambiarNivelPermiso = (rol: RolUsuario, modulo: string, nuevoNivel: NivelPermiso) => {
    // Proteger al administrador en modulo de configuracion para prevenir perdida de acceso
    if (rol === "ADMINISTRADOR" && modulo === "configuracion" && nuevoNivel === "NINGUNO") {
      setFeedback({
        type: "error",
        text: "El rol de Administrador no puede ser bloqueado del módulo de Configuración para prevenir pérdidas de acceso.",
      });
      return;
    }

    setPermisosMap((prev) => ({
      ...prev,
      [`${rol}_${modulo}`]: nuevoNivel,
    }));
    setHasUnsavedPermisos(true);
    setFeedback(null);
  };

  const handleGuardarPermisos = async () => {
    setIsSavingPermisos(true);
    setFeedback(null);

    try {
      const cambios: Array<{ rol: RolUsuario; modulo: string; nivel: NivelPermiso }> = [];
      const roles: RolUsuario[] = ["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"];

      for (const r of roles) {
        for (const m of MODULOS_SISTEMA) {
          const nivel = permisosMap[`${r}_${m.id}`] || "CONSULTA";
          cambios.push({ rol: r, modulo: m.id, nivel });
        }
      }

      const res = await fetch("/api/permisos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cambios }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No se pudieron guardar los permisos.");
      }

      setHasUnsavedPermisos(false);
      setFeedback({
        type: "success",
        text: "Matriz de permisología guardada y sincronizada exitosamente con la base de datos.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al guardar los permisos.",
      });
    } finally {
      setIsSavingPermisos(false);
    }
  };

  const handleRestablecerPermisosDefecto = async () => {
    setIsResettingPermisos(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/permisos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_DEFAULTS" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No se pudieron restablecer los permisos.");
      }

      const newMap: Record<string, NivelPermiso> = {};
      const roles: RolUsuario[] = ["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"];
      for (const r of roles) {
        for (const m of MODULOS_SISTEMA) {
          newMap[`${r}_${m.id}`] = PERMISOS_DEFAULT[r]?.[m.id] || "CONSULTA";
        }
      }

      setPermisosMap(newMap);
      setHasUnsavedPermisos(false);
      setFeedback({
        type: "success",
        text: "Permisos restablecidos a los valores predeterminados de fábrica en la base de datos.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al restablecer permisos.",
      });
    } finally {
      setIsResettingPermisos(false);
    }
  };

  // Feedback general
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Marcas automotrices para asociar y filtrar la plantilla de modelos
  const marcasDisponibles = opciones.filter((o) => o.categoria === "MARCA_VEHICULO");
  const [marcaFiltroModelo, setMarcaFiltroModelo] = useState<string>("Chevrolet");
  const [busquedaModelo, setBusquedaModelo] = useState<string>("");

  const categoriaInfo =
    CATEGORIAS_PLANTILLA.find((c) => c.id === categoriaActiva) || CATEGORIAS_PLANTILLA[0];

  const categoriaTarget =
    categoriaActiva === "MODELO_VEHICULO"
      ? getCategoriaModelo(marcaFiltroModelo)
      : categoriaActiva;

  const opcionesActuales =
    categoriaActiva === "MODELO_VEHICULO"
      ? opciones.filter((o) => o.categoria === categoriaTarget)
      : opciones.filter((o) => o.categoria === categoriaActiva);

  const opcionesFiltradas =
    categoriaActiva === "MODELO_VEHICULO" && busquedaModelo.trim()
      ? opcionesActuales.filter((o) =>
          o.valor.toLowerCase().includes(busquedaModelo.toLowerCase().trim())
        )
      : opcionesActuales;

  // =================== Handlers de Plantillas ===================
  const handleAgregarOpcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoValor.trim()) return;

    setIsLoadingOpcion(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: categoriaTarget,
          valor: nuevoValor.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo registrar la opcion.");
      }

      setOpciones((prev) => [...prev, data.data]);
      setNuevoValor("");
      setFeedback({
        type: "success",
        text:
          categoriaActiva === "MODELO_VEHICULO"
            ? `El modelo "${data.data.valor}" fue agregado a la marca ${marcaFiltroModelo}.`
            : `La opcion "${data.data.valor}" fue agregada exitosamente a la plantilla.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al registrar la nueva opcion.",
      });
    } finally {
      setIsLoadingOpcion(false);
    }
  };

  const handleEliminarOpcion = async (id: string, valor: string) => {
    setDeletingOpcionId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/catalogos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar la opcion.");
      }

      setOpciones((prev) => prev.filter((o) => o.id !== id));
      setFeedback({
        type: "success",
        text: `La opcion "${valor}" fue removida de la plantilla.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al eliminar la opcion.",
      });
    } finally {
      setDeletingOpcionId(null);
    }
  };

  // =================== Handlers de Usuarios ===================
  const handleSeleccionarClienteTitular = async (clienteId: string) => {
    const selected = clientes.find((c) => c.id === clienteId);
    if (!selected) {
      setUserFormData((prev) => ({ ...prev, clienteId: "" }));
      return;
    }

    setUserFormData((prev) => ({
      ...prev,
      clienteId,
      nombre: selected.nombre,
    }));

    setIsGenerandoCredenciales(true);
    try {
      const res = await fetch(
        `/api/usuarios/generar-username?nombre=${encodeURIComponent(selected.nombre)}&documento=${encodeURIComponent(selected.documentoIdentidad || "")}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.username) {
          setUserFormData((prev) => ({
            ...prev,
            clienteId,
            nombre: selected.nombre,
            usuario: data.username,
            password: data.passwordSugerida || prev.password,
          }));
        }
      }
    } catch (err) {
      console.error("Error al sugerir usuario de cliente:", err);
    } finally {
      setIsGenerandoCredenciales(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setFeedback(null);

    try {
      const payload: any = {
        nombre: userFormData.nombre.trim(),
        usuario: userFormData.usuario.trim().toLowerCase().replace(/\s+/g, '_'),
        rol: userFormData.rol,
        password: userFormData.password.trim(),
      };

      if (userFormData.rol === "CLIENTE" && userFormData.clienteId) {
        payload.clienteId = userFormData.clienteId;
      }

      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el usuario.");
      }

      setUsuarios((prev) => [...prev, data.data]);
      setShowCreateUserModal(false);
      setUserFormData({
        nombre: "",
        usuario: "",
        rol: "SUPERVISOR",
        password: "admin",
        clienteId: "",
      });
      setFeedback({
        type: "success",
        text: `Usuario "${data.data.nombre}" (@${data.data.usuario}) registrado correctamente con rol ${ROLES_INFO[data.data.rol as RolUsuario]?.label}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al crear el usuario.",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleRestablecerClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword) return;

    setIsResettingPassword(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userToResetPassword.id,
          action: "RESET_PASSWORD",
          newPassword: newPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo restablecer la contraseña.");
      }

      setUserToResetPassword(null);
      setNewPasswordInput("");
      setFeedback({
        type: "success",
        text: `La contraseña del usuario ${userToResetPassword.nombre} fue actualizada exitosamente.`,
      });
    } catch (err: any) {
      alert(err.message || "Error al restablecer la contraseña.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleEliminarUsuario = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/usuarios?id=${encodeURIComponent(userToDelete.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar el usuario.");
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setFeedback({
        type: "success",
        text: `El usuario ${userToDelete.nombre} fue eliminado correctamente.`,
      });
      setUserToDelete(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error al eliminar el usuario.",
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Barra de Sub-pestañas Superior */}
      <div className="border-b border-slate-200 bg-white rounded-lg p-1.5 shadow-2xs">
        <nav className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("plantillas");
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "plantillas"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Plantillas y Menus</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "plantillas"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {opciones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("apariencia");
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "apariencia"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Apariencia y Tema</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "apariencia"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {themeMode === "dark" ? "Oscuro" : "Claro"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("usuarios");
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "usuarios"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Roles y Usuarios</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "usuarios"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {usuarios.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Banner de Retroalimentacion */}
      {feedback && (
        <div
          className={`p-3.5 rounded-md border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline ml-3 font-medium opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ========================================================
          SUB-PESTAÑA 1: PLANTILLAS Y MENUS DESPLEGABLES
      ======================================================== */}
      {activeTab === "plantillas" && (
        <div className="space-y-6">
          {/* Selector de Categoria de Menu Desplegable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {CATEGORIAS_PLANTILLA.map((cat) => {
              const Icon = cat.icon;
              const isSelected = categoriaActiva === cat.id;
              const count =
                cat.id === "MODELO_VEHICULO"
                  ? opciones.filter((o) => o.categoria.startsWith("MODELO_")).length
                  : opciones.filter((o) => o.categoria === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoriaActiva(cat.id);
                    setFeedback(null);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                      : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono truncate">
                        {cat.nombre}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          isSelected ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {cat.descripcion}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selector de Marca Automotriz (Exclusivo para la Categoria Modelos por Marca) */}
          {categoriaActiva === "MODELO_VEHICULO" && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-600" />
                    <span>Seleccionar Marca Automotriz a Gestionar</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elija la marca para visualizar, agregar o remover sus modelos especificos del mercado venezolano
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <select
                    value={marcaFiltroModelo}
                    onChange={(e) => {
                      setMarcaFiltroModelo(e.target.value);
                      setBusquedaModelo("");
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    {marcasDisponibles.map((m) => {
                      const countM = opciones.filter(
                        (o) => o.categoria === getCategoriaModelo(m.valor)
                      ).length;
                      return (
                        <option key={m.id} value={m.valor}>
                          {m.valor} ({countM} modelos)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Botones de marcas frecuentes para cambio en 1 toque */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">
                  Marcas frecuentes:
                </span>
                {marcasDisponibles.slice(0, 8).map((m) => {
                  const isSelected =
                    marcaFiltroModelo.toLowerCase() === m.valor.toLowerCase();
                  const countM = opciones.filter(
                    (o) => o.categoria === getCategoriaModelo(m.valor)
                  ).length;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMarcaFiltroModelo(m.valor);
                        setBusquedaModelo("");
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{m.valor}</span>
                      <span
                        className={`ml-1 text-[10px] ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        ({countM})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formulario para Agregar Nueva Opcion */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-600" />
                <span>
                  {categoriaActiva === "MODELO_VEHICULO"
                    ? `Incorporar Nuevo Modelo a la Marca: ${marcaFiltroModelo}`
                    : `Incorporar Nueva Opcion al Menu: ${categoriaInfo.nombre}`}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {categoriaActiva === "MODELO_VEHICULO"
                  ? `El modelo quedara vinculado a ${marcaFiltroModelo} para autocompletar al registrar un vehiculo.`
                  : "Agregue un valor adicional para que aparezca automaticamente en los formularios del sistema."}
              </p>
            </div>

            <form onSubmit={handleAgregarOpcion} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                placeholder={
                  categoriaActiva === "MODELO_VEHICULO"
                    ? `Ej. Aveo LT, Optra Design, Hilux Kavak...`
                    : categoriaInfo.placeholder
                }
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
              />
              <button
                type="submit"
                disabled={isLoadingOpcion || !nuevoValor.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm shrink-0"
              >
                {isLoadingOpcion ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {categoriaActiva === "MODELO_VEHICULO"
                        ? `Agregar a ${marcaFiltroModelo}`
                        : "Agregar a la Plantilla"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Listado de Opciones Configuradas */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  {categoriaActiva === "MODELO_VEHICULO"
                    ? `Modelos Registrados de ${marcaFiltroModelo} (${opcionesFiltradas.length})`
                    : `Valores Actuales (${opcionesFiltradas.length})`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {categoriaActiva === "MODELO_VEHICULO"
                    ? `Listado de modelos de ${marcaFiltroModelo} disponibles para la flota`
                    : `Elementos registrados para la categoria: ${categoriaInfo.nombre}`}
                </p>
              </div>

              {categoriaActiva === "MODELO_VEHICULO" && opcionesActuales.length > 5 && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busquedaModelo}
                    onChange={(e) => setBusquedaModelo(e.target.value)}
                    placeholder={`Buscar en ${marcaFiltroModelo}...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              )}

              {categoriaActiva !== "MODELO_VEHICULO" && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {categoriaInfo.id}
                </span>
              )}
            </div>

            {opcionesFiltradas.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-xs">
                  {categoriaActiva === "MODELO_VEHICULO"
                    ? `No hay modelos registrados para la marca ${marcaFiltroModelo}`
                    : "No hay opciones registradas en esta categoria"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Utilice el campo superior para incorporar el primer modelo.
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {opcionesFiltradas.map((opcion) => (
                    <div
                      key={opcion.id}
                      className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 transition-colors text-xs"
                    >
                      <span className="font-medium text-slate-800 truncate pr-2" title={opcion.valor}>
                        {opcion.valor}
                      </span>

                      <button
                        type="button"
                        disabled={deletingOpcionId === opcion.id}
                        onClick={() => handleEliminarOpcion(opcion.id, opcion.valor)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title={`Eliminar "${opcion.valor}"`}
                      >
                        {deletingOpcionId === opcion.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-PESTAÑA 2: APARIENCIA Y TEMAS
      ======================================================== */}
      {activeTab === "apariencia" && (
        <div className="space-y-6">
          {/* Seccion 1: Modo de Interfaz */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Modo de Visualizacion de Interfaz</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Seleccione el modo visual preferido para el sistema. Se almacena localmente en su dispositivo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setThemeMode("light");
                  setFeedback({ type: "success", text: "Modo visual cambiado a Modo Claro." });
                }}
                className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  themeMode === "light"
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    themeMode === "light" ? "bg-slate-800 text-amber-300" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs block">Modo Claro</span>
                  <span
                    className={`text-[10px] ${
                      themeMode === "light" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    Optimo para oficinas y alta luz
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode("dark");
                  setFeedback({ type: "success", text: "Modo visual cambiado a Modo Oscuro (Dark Mode)." });
                }}
                className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  themeMode === "dark"
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    themeMode === "dark" ? "bg-slate-800 text-sky-300" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs block">Modo Oscuro</span>
                  <span
                    className={`text-[10px] ${
                      themeMode === "dark" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    Alto contraste y descanso visual
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode("system");
                  setFeedback({ type: "success", text: "Modo visual sincronizado con el Sistema Operativo." });
                }}
                className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  themeMode === "system"
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    themeMode === "system" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs block">Automatico (Sistema)</span>
                  <span
                    className={`text-[10px] ${
                      themeMode === "system" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    Sincronizado con su S.O.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Seccion 2: Paletas de Colores Corporativas e Ingenieriles */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-600" />
                <span>Paletas de Colores de Ingenieria</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Esquemas cromaticos sobrios disenados para entornos tecnicos automotrices y gestion de activos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PALETAS.map((pal) => {
                const isSelected = palette === pal.id;

                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      setPalette(pal.id);
                      setFeedback({ type: "success", text: `Paleta aplicada: ${pal.nombre}.` });
                    }}
                    className={`p-4 rounded-lg border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                        : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border ${pal.colorPreview}`} />
                        <span className="font-bold text-xs">{pal.nombre}</span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {pal.descripcion}
                      </p>
                    </div>

                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vista Previa Interactiva */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Demostracion Visual del Tema Activo
            </h3>
            <p className="text-xs text-slate-500">
              Asi se visualizan los elementos de control y estados con la configuracion actual ({themeMode.toUpperCase()} — {palette.toUpperCase()}):
            </p>

            <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium shadow-xs"
              >
                Boton Primario
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium"
              >
                Boton Secundario
              </button>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Estado: COMPLETADO
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Garantia Activa
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                Odometro: 12.000 km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-PESTAÑA 3: ROLES Y GESTION DE USUARIOS
      ======================================================== */}
      {activeTab === "usuarios" && (
        <div className="space-y-6">
          {/* Cabecera y Boton de Alta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                Control de Acceso, Roles y Permisología
              </h2>
              <p className="text-xs text-slate-500">
                Administración de cuentas de operadores, mecánicos y portal de clientes
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateUserModal(true);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Nuevo Usuario</span>
            </button>
          </div>

          {/* 1. Tarjetas Informativas de los 4 Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {(["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"] as RolUsuario[]).map((rolKey) => {
              const info = ROLES_INFO[rolKey];
              const count = usuarios.filter((u) => u.rol === rolKey).length;
              const isFiltered = rolFiltroPermiso === rolKey;

              return (
                <button
                  key={rolKey}
                  type="button"
                  onClick={() => setRolFiltroPermiso(isFiltered ? "TODOS" : rolKey)}
                  className={`p-4 rounded-lg border text-left transition-all relative ${
                    isFiltered
                      ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-800"
                      : `bg-white hover:border-slate-300 text-slate-800 shadow-xs ${info.colorBg}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isFiltered ? "bg-slate-800 text-white border-slate-700" : info.badgeClass
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {info.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        isFiltered
                          ? "bg-slate-800 text-slate-200"
                          : "bg-white/80 border border-slate-200 text-slate-700"
                      }`}
                    >
                      {count} {count === 1 ? "usuario" : "usuarios"}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-semibold mt-1 ${
                      isFiltered ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {info.responsabilidad}
                  </p>
                  <p
                    className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                      isFiltered ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {info.desc}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
                    <span className={isFiltered ? "text-sky-300 font-semibold" : "text-slate-400"}>
                      {isFiltered ? "Mostrando en matriz" : "Clic para ver permisos"}
                    </span>
                    <span className={isFiltered ? "text-sky-300" : "text-slate-400"}>&rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. Matriz de Permisología por Apartado del Sistema (Interactiva y Modificable) */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                      Matriz de Permisología y Niveles de Autorización por Apartado
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Modifique los permisos de cada rol en los módulos del sistema y guarde los cambios en la base de datos
                  </p>
                </div>

                {/* Botones de Accion de Permisos */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isResettingPermisos || isSavingPermisos}
                    onClick={handleRestablecerPermisosDefecto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-mono transition-colors shadow-2xs"
                    title="Restablecer todos los permisos a la configuración estándar de fábrica"
                  >
                    {isResettingPermisos ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Por Defecto</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasUnsavedPermisos || isSavingPermisos}
                    onClick={handleGuardarPermisos}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all shadow-sm ${
                      hasUnsavedPermisos
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-600/30 animate-pulse"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isSavingPermisos ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Selector / Filtro de Rol e Indicador de Cambios */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">
                    Filtrar Rol:
                  </span>
                  <button
                    type="button"
                    onClick={() => setRolFiltroPermiso("TODOS")}
                    className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors ${
                      rolFiltroPermiso === "TODOS"
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Comparativa Total
                  </button>
                  {(["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"] as RolUsuario[]).map(
                    (r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRolFiltroPermiso(r)}
                        className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors ${
                          rolFiltroPermiso === r
                            ? "bg-slate-900 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {ROLES_INFO[r].label}
                      </button>
                    )
                  )}
                </div>

                {hasUnsavedPermisos && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                    Hay cambios pendientes por guardar
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-72">Apartado / Módulo</th>
                    {(rolFiltroPermiso === "TODOS"
                      ? (["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"] as RolUsuario[])
                      : [rolFiltroPermiso]
                    ).map((r) => (
                      <th key={r} className="py-3 px-4 min-w-[220px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${ROLES_INFO[r].badgeClass}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {ROLES_INFO[r].label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MATRIZ_PERMISOS.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-slate-900">{item.apartado}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </td>

                      {(rolFiltroPermiso === "TODOS"
                        ? (["ADMINISTRADOR", "SUPERVISOR", "MECANICO_OPERADOR", "CLIENTE"] as RolUsuario[])
                        : [rolFiltroPermiso]
                      ).map((r) => {
                        const currentNivel = permisosMap[`${r}_${item.id}`] || "CONSULTA";
                        const nivelConfig = NIVEL_PERMISO_CONFIG[currentNivel] || NIVEL_PERMISO_CONFIG.CONSULTA;
                        const isProtected = r === "ADMINISTRADOR" && item.id === "configuracion";

                        return (
                          <td key={r} className="py-3.5 px-4 align-top space-y-1.5">
                            {/* Selector Interactivo de Nivel de Permiso */}
                            <div className="relative">
                              <select
                                disabled={isProtected}
                                value={currentNivel}
                                onChange={(e) =>
                                  handleCambiarNivelPermiso(
                                    r,
                                    item.id,
                                    e.target.value as NivelPermiso
                                  )
                                }
                                className={`w-full py-1.5 px-2.5 text-xs font-mono font-bold rounded-md border transition-all focus:outline-none focus:ring-1 ${
                                  nivelConfig.selectClass
                                } ${isProtected ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <option value="TOTAL">Acceso Total</option>
                                <option value="OPERACION">Operación</option>
                                <option value="CONSULTA">Solo Lectura</option>
                                <option value="NINGUNO">Sin Acceso</option>
                              </select>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-snug">
                              {item.permisos[r]?.detalle}
                            </p>

                            {isProtected && (
                              <p className="text-[9px] font-mono text-rose-600 font-semibold">
                                * Bloqueo inhabilitado para Administrador
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Directorio de Usuarios Registrados */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Directorio de Cuentas Registradas en el Sistema
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lista de usuarios activos con credenciales, vinculación y acciones operativas
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Total: {usuarios.length} cuentas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Operador / Titular
                    </th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Nombre de Usuario
                    </th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Rol Asignado
                    </th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Vinculacion
                    </th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-center">
                      Estado
                    </th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium">No hay usuarios registrados</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Comience creando el primer operador con el boton superior.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => {
                      const roleConfig = ROLES_INFO[u.rol] || ROLES_INFO.SUPERVISOR;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                                {u.nombre.slice(0, 1).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900">{u.nombre}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                            @{u.usuario}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${roleConfig.badgeClass}`}
                              title={roleConfig.desc}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {roleConfig.label}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {u.rol === "CLIENTE" && u.cliente ? (
                              <span className="text-slate-800 font-medium">
                                Titular: {u.cliente.nombre}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Personal Interno</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                u.activo
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.activo ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Boton para Restablecer Clave */}
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToResetPassword(u);
                                  setNewPasswordInput("");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                                title="Restablecer Contraseña"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                                <span>Clave</span>
                              </button>

                              {/* Boton para Eliminar */}
                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                className="p-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                                title="Eliminar Usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REGISTRAR NUEVO USUARIO
      ======================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Alta de Usuario en el Sistema</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asigne credenciales y nivel de autorizacion
                </p>
              </div>
            </div>

            <form onSubmit={handleCrearUsuario} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre Completo <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.nombre}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. Ing. Roberto Hernandez"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre de Usuario (Username) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={userFormData.usuario}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        usuario: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                      }))
                    }
                    placeholder="carlos_mendez, supervisor, jesus..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Identificador simple para iniciar sesión o distinguir al operador.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Rol en el Sistema <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={userFormData.rol}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, rol: e.target.value as RolUsuario }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option value="MECANICO_OPERADOR">MECANICO_OPERADOR</option>
                    <option value="CLIENTE">CLIENTE (Portal)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Contraseña Inicial <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimo 4 caracteres"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Si es rol CLIENTE, mostrar vinculacion con Cliente */}
              {userFormData.rol === "CLIENTE" && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-md space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-purple-900">
                      Vincular a Cliente Titular <span className="text-rose-600">*</span>
                    </label>
                    {isGenerandoCredenciales && (
                      <span className="flex items-center gap-1 text-[11px] text-purple-700 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generando usuario disponible...
                      </span>
                    )}
                  </div>
                  <select
                    required
                    value={userFormData.clienteId}
                    onChange={(e) => handleSeleccionarClienteTitular(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Seleccione el cliente titular...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.documentoIdentidad ? `(${c.documentoIdentidad})` : "(Persona Natural)"}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-purple-700">
                    Al seleccionar el cliente se autocompleta su nombre, su identificador único (@usuario) y clave sugerida.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isCreatingUser}
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Registrar Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RESTABLECER CONTRASEÑA
      ======================================================== */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Restablecer Contraseña
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {userToResetPassword.nombre} (@{userToResetPassword.usuario})
                </p>
              </div>
            </div>

            <form onSubmit={handleRestablecerClave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nueva Contraseña Temporal o Definitiva
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Ej. AutoGest2026*"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  La contraseña se actualizara inmediatamente en la base de datos PostgreSQL.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isResettingPassword}
                  onClick={() => setUserToResetPassword(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword || newPasswordInput.trim().length < 4}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Guardar Nueva Clave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRMAR ELIMINAR USUARIO
      ======================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden text-left p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Confirmar Eliminacion de Usuario
                </h3>
                <p className="text-xs text-slate-600">
                  ¿Desea eliminar la cuenta de{" "}
                  <strong className="text-slate-900">{userToDelete.nombre}</strong> (
                  <span className="font-mono">@{userToDelete.usuario}</span>)?
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleEliminarUsuario}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar Usuario</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
