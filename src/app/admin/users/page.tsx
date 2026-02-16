"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { DataTable, Column } from "@/components/admin/tables/DataTable";
import { Card, Button, Badge, Input, Select } from "@/components/admin/ui/Components";
import type { User, UserStatus } from "@/lib/admin/types";

export default function UsersPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (isAuthenticated) {
      // Load users
      // In a real app, this would call getUsers()
      // For now, use mock data
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: "1",
            email: "john.doe@mail.aub.edu",
            displayName: "John Doe",
            status: "active",
            verified: true,
            createdAt: "2024-01-15T10:30:00Z",
            lastLogin: "2024-02-16T09:15:00Z",
            reviewCount: 15,
            reportCount: 0,
          },
          {
            id: "2",
            email: "jane.smith@mail.aub.edu",
            displayName: "Jane Smith",
            status: "active",
            verified: true,
            createdAt: "2024-01-20T14:20:00Z",
            lastLogin: "2024-02-15T18:30:00Z",
            reviewCount: 8,
            reportCount: 0,
          },
          {
            id: "3",
            email: "bob.wilson@mail.aub.edu",
            displayName: "Bob Wilson",
            status: "suspended",
            verified: true,
            createdAt: "2023-12-10T08:00:00Z",
            lastLogin: "2024-02-10T12:00:00Z",
            reviewCount: 23,
            reportCount: 2,
          },
          {
            id: "4",
            email: "alice.brown@mail.aub.edu",
            displayName: "Alice Brown",
            status: "active",
            verified: true,
            createdAt: "2024-02-01T09:00:00Z",
            lastLogin: "2024-02-16T10:00:00Z",
            reviewCount: 5,
            reportCount: 0,
          },
          {
            id: "5",
            email: "charlie.davis@mail.aub.edu",
            displayName: "Charlie Davis",
            status: "banned",
            verified: false,
            createdAt: "2023-11-15T15:30:00Z",
            reviewCount: 42,
            reportCount: 7,
          },
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    }
  }, [authLoading, isAuthenticated, router]);

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, "success" | "warning" | "danger"> = {
      active: "success",
      suspended: "warning",
      banned: "danger",
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const columns: Column<User>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "displayName",
      label: "Name",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (value: UserStatus) => getStatusBadge(value),
      sortable: true,
    },
    {
      key: "verified",
      label: "Verified",
      render: (value: boolean) => (
        <Badge variant={value ? "success" : "warning"}>
          {value ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "reviewCount",
      label: "Reviews",
      sortable: true,
    },
    {
      key: "reportCount",
      label: "Reports",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            View
          </Button>
          {user.status === "active" && (
            <Button size="sm" variant="danger">
              Suspend
            </Button>
          )}
          {user.status === "suspended" && (
            <Button size="sm" variant="success">
              Unsuspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (authLoading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage and moderate user accounts
            </p>
          </div>
          <Button onClick={() => alert("Export functionality")}>
            Export Users
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              type="search"
              value={search}
              onChange={setSearch}
              placeholder="Search by email or name..."
            />
            <Select
              label="Status Filter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All Statuses", value: "" },
                { label: "Active", value: "active" },
                { label: "Suspended", value: "suspended" },
                { label: "Banned", value: "banned" },
              ]}
            />
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <DataTable
            columns={columns}
            data={users}
            pagination={{
              page,
              perPage,
              total: 125,
              totalPages: Math.ceil(125 / perPage),
            }}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            isLoading={loading}
            emptyMessage="No users found"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
