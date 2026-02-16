// Admin API utility functions

import { apiFetch } from "@/lib/api";
import type { 
  AdminUser, 
  User, 
  Review, 
  Report, 
  Professor, 
  Course, 
  DashboardMetrics, 
  ApiResponse,
  AuditLog 
} from "./types";

// Admin Authentication
export async function adminLogin(email: string, password: string) {
  return apiFetch<{ token: string; refreshToken: string; user: AdminUser }>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function verifyMFA(userId: string, token: string, mfaCode: string) {
  return apiFetch<{ token: string; user: AdminUser }>(
    "/admin/auth/mfa/verify",
    {
      method: "POST",
      body: JSON.stringify({ userId, token, mfaCode }),
    }
  );
}

export async function adminLogout(token: string) {
  return apiFetch<{ message: string }>("/admin/auth/logout", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// Dashboard
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>("/admin/analytics/dashboard");
}

// User Management
export async function getUsers(params: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<User[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<User[]>>(`/admin/users?${queryString}`);
}

export async function getUserDetails(userId: string): Promise<User> {
  return apiFetch<User>(`/admin/users/${userId}`);
}

export async function suspendUser(
  userId: string, 
  reason: string, 
  duration: string, 
  notes?: string
) {
  return apiFetch<{ message: string; user: User }>(
    `/admin/users/${userId}/suspend`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason, duration, notes }),
    }
  );
}

export async function banUser(userId: string, reason: string, notes?: string) {
  return apiFetch<{ message: string; user: User }>(
    `/admin/users/${userId}/ban`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason, notes }),
    }
  );
}

export async function unsuspendUser(userId: string, notes?: string) {
  return apiFetch<{ message: string }>(`/admin/users/${userId}/unsuspend`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}

export async function deleteUser(userId: string, reason: string, confirmEmail: string) {
  return apiFetch<{ message: string; deletedData: Record<string, unknown> }>(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ reason, confirmEmail }),
    }
  );
}

// Review Management
export async function getReviews(params: {
  page?: number;
  perPage?: number;
  status?: string;
  flaggedOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Review[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<Review[]>>(`/admin/reviews?${queryString}`);
}

export async function getReviewDetails(reviewId: string): Promise<Review> {
  return apiFetch<Review>(`/admin/reviews/${reviewId}`);
}

export async function approveReview(reviewId: string, notes?: string) {
  return apiFetch<{ message: string; review: Review }>(
    `/admin/reviews/${reviewId}/approve`,
    {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }
  );
}

export async function removeReview(
  reviewId: string, 
  reason: string, 
  notifyUser: boolean, 
  notes?: string
) {
  return apiFetch<{ message: string }>(`/admin/reviews/${reviewId}/remove`, {
    method: "PATCH",
    body: JSON.stringify({ reason, notifyUser, notes }),
  });
}

export async function editReview(
  reviewId: string, 
  content: string, 
  reason: string
) {
  return apiFetch<{ message: string; review: Review }>(
    `/admin/reviews/${reviewId}/edit`,
    {
      method: "PATCH",
      body: JSON.stringify({ content, reason, preserveOriginal: true }),
    }
  );
}

// Reports Management
export async function getReports(params: {
  page?: number;
  perPage?: number;
  status?: string;
  priority?: string;
  type?: string;
}): Promise<ApiResponse<Report[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<Report[]>>(`/admin/reports?${queryString}`);
}

export async function assignReport(reportId: string, adminId: string) {
  return apiFetch<{ message: string }>(`/admin/reports/${reportId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ adminId }),
  });
}

export async function resolveReport(
  reportId: string, 
  resolution: string, 
  actionTaken: string, 
  notifyReporter: boolean
) {
  return apiFetch<{ message: string }>(`/admin/reports/${reportId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ resolution, actionTaken, notifyReporter }),
  });
}

export async function dismissReport(reportId: string, reason: string, notes?: string) {
  return apiFetch<{ message: string }>(`/admin/reports/${reportId}/dismiss`, {
    method: "PATCH",
    body: JSON.stringify({ reason, notes }),
  });
}

// Professor Management
export async function getProfessors(params: {
  page?: number;
  perPage?: number;
  search?: string;
  department?: string;
  archived?: boolean;
}): Promise<ApiResponse<Professor[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<Professor[]>>(`/admin/professors?${queryString}`);
}

export async function addProfessor(data: {
  name: string;
  department: string;
  email?: string;
  title?: string;
  bio?: string;
}) {
  return apiFetch<{ message: string; professor: Professor }>(
    "/admin/professors",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateProfessor(professorId: string, data: Partial<Professor>) {
  return apiFetch<{ message: string }>(`/admin/professors/${professorId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function mergeProfessors(
  sourceProfessorId: string, 
  targetProfessorId: string
) {
  return apiFetch<{ message: string; reviewsTransferred: number }>(
    `/admin/professors/${sourceProfessorId}/merge`,
    {
      method: "POST",
      body: JSON.stringify({ targetProfessorId, transferReviews: true }),
    }
  );
}

// Course Management
export async function getCourses(params: {
  page?: number;
  perPage?: number;
  search?: string;
  department?: string;
}): Promise<ApiResponse<Course[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<Course[]>>(`/admin/courses?${queryString}`);
}

export async function addCourse(data: {
  code: string;
  name: string;
  department: string;
  credits: number;
  description?: string;
}) {
  return apiFetch<{ message: string; course: Course }>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Audit Logs
export async function getAuditLogs(params: {
  page?: number;
  perPage?: number;
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AuditLog[]>> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return apiFetch<ApiResponse<AuditLog[]>>(`/admin/audit-logs?${queryString}`);
}
