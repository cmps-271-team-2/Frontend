"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AdminUser } from "./types";

type AdminAuthContextType = {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (from localStorage/sessionStorage)
    const checkAuth = () => {
      try {
        const storedAdmin = localStorage.getItem("admin_user");
        const storedToken = localStorage.getItem("admin_token");
        
        if (storedAdmin && storedToken) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    // This is a placeholder - actual implementation will call the admin API
    // For now, just simulate login
    const mockAdmin: AdminUser = {
      id: "admin-1",
      email,
      role: "super_admin",
      permissions: ["*"],
      createdAt: new Date().toISOString(),
    };

    setAdmin(mockAdmin);
    localStorage.setItem("admin_user", JSON.stringify(mockAdmin));
    localStorage.setItem("admin_token", "mock-token");
  };

  const logout = async () => {
    setAdmin(null);
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_token");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
