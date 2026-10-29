export type EstadoMantenimiento = "PENDIENTE" | "EN_PROCESO" | "COMPLETADO";

export type RolUsuario =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "MECANICO_OPERADOR"
  | "CLIENTE";

export type NivelPermiso = "TOTAL" | "OPERACION" | "CONSULTA" | "NINGUNO";

export interface PermisoRolItem {
  id?: string;
  rol: RolUsuario;
  modulo: string;
  nivel: NivelPermiso;
}

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  password?: string;
  rol: RolUsuario;
  activo: boolean;
  clienteId?: string | null;
  cliente?: Cliente | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Cliente {
  id: string;
  nombre: string;
  documentoIdentidad?: string | null;
  telefono?: string | null;
  correo?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Vehiculo {
  id: string;
  placa?: string | null;
  marca: string;
  modelo: string;
  anio: number;
  tipo?: string;
  clienteId: string;
  cliente?: Cliente;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    mantenimientos: number;
  };
}

export interface Mantenimiento {
  id: string;
  fechaProgramada: Date | string;
  descripcionServicio: string;
  estado: EstadoMantenimiento;
  kilometraje?: number | null;
  horasHombre?: number | null;
  costoManoObra?: number | null;
  costoManoObraBs?: number | null;
  tasaCambio?: number | null;
  esGarantia?: boolean;
  vehiculoId: string;
  vehiculo?: Vehiculo & {
    cliente?: Cliente;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

