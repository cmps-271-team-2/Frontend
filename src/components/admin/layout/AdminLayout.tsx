"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Reviews", href: "/admin/reviews", icon: "⭐" },
  { label: "Reports", href: "/admin/reports", icon: "🚨" },
  { label: "Professors", href: "/admin/professors", icon: "👨‍🏫" },
  { label: "Courses", href: "/admin/courses", icon: "📚" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">AUB Rate Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Logged in as</div>
          <div className="text-sm font-medium mb-2">{admin?.email}</div>
          <div className="text-xs text-gray-500 mb-3">
            Role: {admin?.role?.replace("_", " ").toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {navItems.find((item) => item.href === pathname)?.label || "Admin Panel"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* Search */}
            <input
              type="search"
              placeholder="Quick search..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
