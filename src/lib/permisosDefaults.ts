import { RolUsuario, NivelPermiso } from "@/types";

export interface ModuloDef {
  id: string;
  apartado: string;
  descripcion: string;
  categoria: string;
}

export const MODULOS_SISTEMA: ModuloDef[] = [
  {
    id: "dashboard",
    apartado: "Panel de Control (Dashboard)",
    descripcion: "Métricas generales del taller, estado de flota, alertas urgentes y cotizaciones",
    categoria: "General",
  },
  {
    id: "clientes",
    apartado: "Gestión de Clientes",
    descripcion: "Fichas de clientes, datos de contacto, documentos de identidad y generación de accesos",
    categoria: "Comercial",
  },
  {
    id: "vehiculos",
    apartado: "Flota y Vehículos",
    descripcion: "Registro de unidades, marcas, modelos, placas, años y odómetro actual",
    categoria: "Técnico",
  },
  {
    id: "mantenimientos",
    apartado: "Órdenes de Mantenimiento",
    descripcion: "Programación técnica, cambio de estado (Pendiente / En Proceso / Completado) y garantías",
    categoria: "Técnico",
  },
  {
    id: "finanzas",
    apartado: "Costeo de Mano de Obra y Finanzas",
    descripcion: "Registro de horas-hombre, tarifas en USD y conversión automática a bolívares (VES)",
    categoria: "Finanzas",
  },
  {
    id: "reportes",
    apartado: "Reportes Técnicos e Historiales",
    descripcion: "Informes de fallas recurrentes, hojas de servicio técnico y certificados de entrega",
    categoria: "Auditoría",
  },
  {
    id: "configuracion",
    apartado: "Configuración, Catálogos y Usuarios",
    descripcion: "Catálogo de marcas/modelos, temas visuales, cuentas de usuario y contraseñas",
    categoria: "Administración",
  },
];

export const PERMISOS_DEFAULT: Record<RolUsuario, Record<string, NivelPermiso>> = {
  ADMINISTRADOR: {
    dashboard: "TOTAL",
    clientes: "TOTAL",
    vehiculos: "TOTAL",
    mantenimientos: "TOTAL",
    finanzas: "TOTAL",
    reportes: "TOTAL",
    configuracion: "TOTAL",
  },
  SUPERVISOR: {
    dashboard: "TOTAL",
    clientes: "OPERACION",
    vehiculos: "TOTAL",
    mantenimientos: "TOTAL",
    finanzas: "TOTAL",
    reportes: "TOTAL",
    configuracion: "CONSULTA",
  },
  MECANICO_OPERADOR: {
    dashboard: "CONSULTA",
    clientes: "CONSULTA",
    vehiculos: "OPERACION",
    mantenimientos: "OPERACION",
    finanzas: "OPERACION",
    reportes: "CONSULTA",
    configuracion: "NINGUNO",
  },
  CLIENTE: {
    dashboard: "NINGUNO",
    clientes: "NINGUNO",
    vehiculos: "CONSULTA",
    mantenimientos: "CONSULTA",
    finanzas: "CONSULTA",
    reportes: "CONSULTA",
    configuracion: "NINGUNO",
  },
};

