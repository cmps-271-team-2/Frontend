"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, StatCard, LoadingSpinner } from "@/components/admin/ui/Components";
import type { DashboardMetrics } from "@/lib/admin/types";

export default function AdminDashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (isAuthenticated) {
      // Load dashboard metrics
      // In a real app, this would call getDashboardMetrics()
      // For now, use mock data
      setTimeout(() => {
        setMetrics({
          users: {
            total: 1250,
            active: 456,
            newToday: 12,
            trend: "+5.2%",
          },
          reviews: {
            total: 3420,
            pending: 23,
            flagged: 8,
            todayCount: 34,
          },
          reports: {
            open: 15,
            inReview: 8,
            critical: 2,
          },
          systemHealth: {
            status: "healthy",
            uptime: "99.9%",
            avgResponseTime: "120ms",
            errorRate: "0.1%",
          },
        });
        setLoading(false);
      }, 500);
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={metrics?.users.total || 0}
            trend={metrics?.users.trend}
            icon="👥"
          />
          <StatCard
            title="Pending Reviews"
            value={metrics?.reviews.pending || 0}
            icon="⭐"
          />
          <StatCard
            title="Open Reports"
            value={metrics?.reports.open || 0}
            icon="🚨"
          />
          <StatCard
            title="System Health"
            value={metrics?.systemHealth.status === "healthy" ? "Healthy" : "Issues"}
            icon="💚"
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Overview */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Users Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{metrics?.users.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">{metrics?.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Today</span>
                <span className="font-semibold text-green-600">
                  +{metrics?.users.newToday}
                </span>
              </div>
            </div>
          </Card>

          {/* Reviews Overview */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Reviews Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{metrics?.reviews.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {metrics?.reviews.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Flagged</span>
                <span className="font-semibold text-red-600">
                  {metrics?.reviews.flagged}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today</span>
                <span className="font-semibold text-green-600">
                  +{metrics?.reviews.todayCount}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Reports & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Status */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Reports Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open Reports</span>
                <span className="font-semibold">{metrics?.reports.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Review</span>
                <span className="font-semibold">{metrics?.reports.inReview}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Critical</span>
                <span className="font-semibold text-red-600">
                  {metrics?.reports.critical}
                </span>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">
                  {metrics?.systemHealth.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-semibold">
                  {metrics?.systemHealth.avgResponseTime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-semibold">
                  {metrics?.systemHealth.errorRate}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin/reviews?status=pending")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Review Pending Content
            </button>
            <button
              onClick={() => router.push("/admin/reports?status=open")}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Check Open Reports
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Manage Users
            </button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
