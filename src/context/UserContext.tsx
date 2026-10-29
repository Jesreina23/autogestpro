"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Usuario, RolUsuario } from "@/types";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: Usuario;
}

interface UserContextType {
  currentUser: Usuario | null;
  usuarios: Usuario[];
  isLoading: boolean;
  login: (usuario: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  switchUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
  isLocked: boolean;
  unlockSession: () => void;
  lockSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/usuarios");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsuarios(json.data);

        // Recuperar usuario guardado en localStorage
        const savedUserId = localStorage.getItem("autogest_active_user_id");
        if (savedUserId) {
          const found = json.data.find((u: Usuario) => u.id === savedUserId && u.activo);
          if (found) {
            setCurrentUser(found);
          } else {
            // Usuario ya no existe o fue desactivado
            localStorage.removeItem("autogest_active_user_id");
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error("Error al cargar usuarios de sesion:", err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const login = async (usuario: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || "Usuario o contraseña incorrectos.",
        };
      }

      setCurrentUser(json.user);
      localStorage.setItem("autogest_active_user_id", json.user.id);
      setIsLocked(false);

      // Refrescar lista de usuarios en segundo plano si es administrador o supervisor
      fetchUsers();

      return {
        success: true,
        user: json.user,
      };
    } catch (err: any) {
      return {
        success: false,
        error: "No se pudo conectar con el servidor. Verifique su red.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("autogest_active_user_id");
    setCurrentUser(null);
    setIsLocked(false);
    router.replace("/login");
  };

  const switchUser = (userId: string) => {
    const target = usuarios.find((u) => u.id === userId && u.activo);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem("autogest_active_user_id", target.id);
    }
  };

  const lockSession = () => {
    setIsLocked(true);
  };

  const unlockSession = () => {
    setIsLocked(false);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        usuarios,
        isLoading,
        login,
        logout,
        switchUser,
        refreshUsers: fetchUsers,
        isLocked,
        lockSession,
        unlockSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
}


