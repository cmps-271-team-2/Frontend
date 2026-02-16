"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, EmptyState } from "@/components/admin/ui/Components";

export default function CoursesPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <EmptyState
          icon="📚"
          title="Courses Management"
          description="This page will allow you to add, edit, and manage course information. Implementation coming soon."
        />
      </Card>
    </AdminLayout>
  );
}
