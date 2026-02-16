// Admin Panel Type Definitions

export type AdminRole = "super_admin" | "moderator" | "support";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
};

export type UserStatus = "active" | "suspended" | "banned";

export type User = {
  id: string;
  email: string;
  displayName?: string;
  status: UserStatus;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
  reviewCount: number;
  reportCount: number;
};

export type ReviewStatus = "pending" | "approved" | "flagged" | "removed";

export type Review = {
  id: string;
  content: string;
  rating: number;
  status: ReviewStatus;
  author: {
    id: string;
    email: string;
  };
  professor: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
  flagCount: number;
  upvotes: number;
  downvotes: number;
};

export type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";
export type ReportPriority = "low" | "medium" | "high" | "critical";
export type ReportType = "harassment" | "spam" | "inappropriate_content" | "other";

export type Report = {
  id: string;
  type: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  reporter: {
    id: string;
    email: string;
  };
  reported: {
    type: "review" | "user" | "comment";
    id: string;
    content?: string;
  };
  reason: string;
  description: string;
  createdAt: string;
  assignedTo?: string;
};

export type Professor = {
  id: string;
  name: string;
  department: string;
  email?: string;
  averageRating: number;
  totalReviews: number;
  archived: boolean;
  createdAt: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  description?: string;
  averageRating: number;
  totalReviews: number;
  archived: boolean;
};

export type DashboardMetrics = {
  users: {
    total: number;
    active: number;
    newToday: number;
    trend: string;
  };
  reviews: {
    total: number;
    pending: number;
    flagged: number;
    todayCount: number;
  };
  reports: {
    open: number;
    inReview: number;
    critical: number;
  };
  systemHealth: {
    status: "healthy" | "warning" | "critical";
    uptime: string;
    avgResponseTime: string;
    errorRate: string;
  };
};

export type PaginationInfo = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  pagination?: PaginationInfo;
};

export type AuditLog = {
  id: string;
  admin: {
    id: string;
    email: string;
  };
  action: string;
  resource: {
    type: string;
    id: string;
  };
  details?: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
};
