# Backend Services Documentation for Admin Panel

## Overview
This document specifies the backend services and API endpoints required to support the Admin Panel functionality. The backend should be built as a RESTful API with proper authentication and authorization.

## 1. Authentication & Authorization Services

### 1.1 Admin Authentication Endpoints

#### POST /admin/auth/login
**Purpose**: Authenticate admin users
```json
Request:
{
  "email": "admin@mail.aub.edu",
  "password": "securePassword123"
}

Response (Success - 200):
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "admin_user_id",
    "email": "admin@mail.aub.edu",
    "role": "super_admin",
    "mfaRequired": true
  }
}

Response (Error - 401):
{
  "detail": "Invalid credentials"
}
```

#### POST /admin/auth/mfa/verify
**Purpose**: Verify MFA code during admin login
```json
Request:
{
  "userId": "admin_user_id",
  "token": "jwt_token_from_login",
  "mfaCode": "123456"
}

Response (Success - 200):
{
  "token": "new_jwt_token_with_mfa_verified",
  "user": {
    "id": "admin_user_id",
    "email": "admin@mail.aub.edu",
    "role": "super_admin",
    "permissions": ["users.read", "users.write", "reviews.moderate", ...]
  }
}
```

#### POST /admin/auth/logout
**Purpose**: Invalidate admin session
```json
Request:
{
  "token": "jwt_token_here"
}

Response (Success - 200):
{
  "message": "Logged out successfully"
}
```

#### POST /admin/auth/refresh
**Purpose**: Refresh expired access token
```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response (Success - 200):
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

### 1.2 Authorization Middleware
**Required**: All admin endpoints must validate:
- Valid JWT token in Authorization header
- Admin role verification
- Permission-based access control
- Session timeout enforcement (30 minutes idle)

## 2. User Management Services

### 2.1 User Listing & Search

#### GET /admin/users
**Purpose**: Retrieve paginated list of users with filtering and sorting
```
Query Parameters:
- page: number (default: 1)
- perPage: number (default: 25, max: 100)
- search: string (search by email, name)
- status: enum (active, suspended, banned)
- sortBy: enum (created_at, last_login, email)
- sortOrder: enum (asc, desc)
- registeredAfter: ISO date
- registeredBefore: ISO date

Response (Success - 200):
{
  "data": [
    {
      "id": "user_id",
      "email": "user@mail.aub.edu",
      "displayName": "John Doe",
      "status": "active",
      "verified": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-02-16T09:15:00Z",
      "reviewCount": 15,
      "reportCount": 0
    },
    ...
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "perPage": 25,
    "totalPages": 50
  }
}
```

### 2.2 User Details

#### GET /admin/users/:userId
**Purpose**: Get detailed information about a specific user
```json
Response (Success - 200):
{
  "id": "user_id",
  "email": "user@mail.aub.edu",
  "displayName": "John Doe",
  "status": "active",
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-02-16T09:15:00Z",
  "ipAddress": "10.0.1.25",
  "statistics": {
    "reviewsSubmitted": 15,
    "ratingsGiven": 23,
    "reportsMade": 2,
    "reportsAgainst": 0
  },
  "recentActivity": [
    {
      "type": "review_submitted",
      "timestamp": "2024-02-15T14:20:00Z",
      "details": "Rated Professor Smith"
    },
    ...
  ]
}
```

### 2.3 User Moderation Actions

#### PATCH /admin/users/:userId/suspend
**Purpose**: Suspend a user account
```json
Request:
{
  "reason": "Violation of community guidelines",
  "duration": "7d",
  "notes": "First offense - temporary suspension"
}

Response (Success - 200):
{
  "message": "User suspended successfully",
  "user": {
    "id": "user_id",
    "status": "suspended",
    "suspensionExpiresAt": "2024-02-23T10:30:00Z"
  }
}
```

#### PATCH /admin/users/:userId/ban
**Purpose**: Permanently ban a user
```json
Request:
{
  "reason": "Repeated violations",
  "notes": "Multiple reports, persistent harassment"
}

Response (Success - 200):
{
  "message": "User banned successfully",
  "user": {
    "id": "user_id",
    "status": "banned"
  }
}
```

#### PATCH /admin/users/:userId/unsuspend
**Purpose**: Remove suspension from a user
```json
Request:
{
  "notes": "Suspension period completed"
}

Response (Success - 200):
{
  "message": "User unsuspended successfully"
}
```

#### DELETE /admin/users/:userId
**Purpose**: Permanently delete user and their data
```json
Request:
{
  "reason": "User requested account deletion",
  "confirmEmail": "user@mail.aub.edu"
}

Response (Success - 200):
{
  "message": "User deleted successfully",
  "deletedData": {
    "reviews": 15,
    "ratings": 23,
    "comments": 8
  }
}
```

## 3. Review & Content Moderation Services

### 3.1 Review Listing

#### GET /admin/reviews
**Purpose**: Get all reviews with filtering
```
Query Parameters:
- page: number
- perPage: number
- status: enum (pending, approved, flagged, removed)
- professorId: string
- courseId: string
- userId: string
- flaggedOnly: boolean
- sortBy: enum (created_at, rating, flag_count)
- sortOrder: enum (asc, desc)

Response (Success - 200):
{
  "data": [
    {
      "id": "review_id",
      "content": "Great professor, very helpful...",
      "rating": 4.5,
      "status": "approved",
      "author": {
        "id": "user_id",
        "email": "user@mail.aub.edu"
      },
      "professor": {
        "id": "prof_id",
        "name": "Dr. John Smith"
      },
      "course": {
        "id": "course_id",
        "code": "CMPS271",
        "name": "Data Structures"
      },
      "createdAt": "2024-02-15T10:30:00Z",
      "flagCount": 0,
      "upvotes": 12,
      "downvotes": 1
    },
    ...
  ],
  "pagination": {...}
}
```

### 3.2 Review Details

#### GET /admin/reviews/:reviewId
**Purpose**: Get detailed review information including flags
```json
Response (Success - 200):
{
  "id": "review_id",
  "content": "Great professor...",
  "rating": 4.5,
  "status": "flagged",
  "author": {...},
  "professor": {...},
  "course": {...},
  "createdAt": "2024-02-15T10:30:00Z",
  "flags": [
    {
      "id": "flag_id",
      "reason": "inappropriate_content",
      "reportedBy": "user2@mail.aub.edu",
      "reportedAt": "2024-02-16T08:00:00Z",
      "notes": "Contains offensive language"
    }
  ],
  "moderationHistory": [
    {
      "action": "flagged",
      "moderator": "admin@mail.aub.edu",
      "timestamp": "2024-02-16T09:00:00Z",
      "notes": "Under review"
    }
  ]
}
```

### 3.3 Review Moderation Actions

#### PATCH /admin/reviews/:reviewId/approve
**Purpose**: Approve a pending or flagged review
```json
Request:
{
  "notes": "Content is appropriate"
}

Response (Success - 200):
{
  "message": "Review approved",
  "review": {
    "id": "review_id",
    "status": "approved"
  }
}
```

#### PATCH /admin/reviews/:reviewId/remove
**Purpose**: Remove inappropriate review
```json
Request:
{
  "reason": "Violates community guidelines",
  "notifyUser": true,
  "notes": "Contains profanity"
}

Response (Success - 200):
{
  "message": "Review removed successfully"
}
```

#### PATCH /admin/reviews/:reviewId/edit
**Purpose**: Edit review content (with audit trail)
```json
Request:
{
  "content": "Updated review content...",
  "reason": "Removed inappropriate language",
  "preserveOriginal": true
}

Response (Success - 200):
{
  "message": "Review updated",
  "review": {
    "id": "review_id",
    "content": "Updated review content...",
    "edited": true,
    "editedAt": "2024-02-16T10:30:00Z",
    "editedBy": "admin@mail.aub.edu"
  }
}
```

## 4. Professor & Course Management Services

### 4.1 Professor Management

#### GET /admin/professors
**Purpose**: List all professors with search and pagination
```
Query Parameters:
- page, perPage, search, sortBy, sortOrder
- department: string
- archived: boolean

Response (Success - 200):
{
  "data": [
    {
      "id": "prof_id",
      "name": "Dr. John Smith",
      "department": "Computer Science",
      "email": "js123@aub.edu.lb",
      "averageRating": 4.2,
      "totalReviews": 145,
      "archived": false,
      "createdAt": "2023-08-01T00:00:00Z"
    },
    ...
  ],
  "pagination": {...}
}
```

#### POST /admin/professors
**Purpose**: Add a new professor
```json
Request:
{
  "name": "Dr. Jane Doe",
  "department": "Computer Science",
  "email": "jd456@aub.edu.lb",
  "title": "Associate Professor",
  "bio": "Specializes in AI and Machine Learning"
}

Response (Success - 201):
{
  "message": "Professor added successfully",
  "professor": {
    "id": "new_prof_id",
    "name": "Dr. Jane Doe",
    ...
  }
}
```

#### PATCH /admin/professors/:professorId
**Purpose**: Update professor information
```json
Request:
{
  "name": "Dr. Jane Doe-Smith",
  "department": "Computer Science",
  "title": "Full Professor"
}

Response (Success - 200):
{
  "message": "Professor updated successfully"
}
```

#### POST /admin/professors/:professorId/merge
**Purpose**: Merge duplicate professor entries
```json
Request:
{
  "targetProfessorId": "prof_id_to_keep",
  "transferReviews": true
}

Response (Success - 200):
{
  "message": "Professors merged successfully",
  "reviewsTransferred": 23
}
```

### 4.2 Course Management

#### GET /admin/courses
**Purpose**: List all courses
```
Similar structure to professors endpoint
```

#### POST /admin/courses
**Purpose**: Add a new course
```json
Request:
{
  "code": "CMPS272",
  "name": "Algorithms",
  "department": "Computer Science",
  "credits": 3,
  "description": "Introduction to algorithms..."
}

Response (Success - 201):
{
  "message": "Course added successfully",
  "course": {...}
}
```

## 5. Reports Management Services

### 5.1 Reports Listing

#### GET /admin/reports
**Purpose**: Get all reports with filtering
```
Query Parameters:
- page, perPage
- status: enum (open, in_review, resolved, dismissed)
- priority: enum (low, medium, high, critical)
- type: enum (harassment, spam, inappropriate_content, other)
- sortBy, sortOrder

Response (Success - 200):
{
  "data": [
    {
      "id": "report_id",
      "type": "inappropriate_content",
      "status": "open",
      "priority": "high",
      "reporter": {
        "id": "user_id",
        "email": "reporter@mail.aub.edu"
      },
      "reported": {
        "type": "review",
        "id": "review_id",
        "content": "Preview of reported content..."
      },
      "reason": "Contains offensive language",
      "description": "This review uses profanity...",
      "createdAt": "2024-02-16T08:00:00Z",
      "assignedTo": null
    },
    ...
  ],
  "pagination": {...}
}
```

### 5.2 Report Actions

#### PATCH /admin/reports/:reportId/assign
**Purpose**: Assign report to an admin
```json
Request:
{
  "adminId": "admin_user_id"
}

Response (Success - 200):
{
  "message": "Report assigned successfully"
}
```

#### PATCH /admin/reports/:reportId/resolve
**Purpose**: Mark report as resolved
```json
Request:
{
  "resolution": "Content removed and user warned",
  "actionTaken": "review_removed",
  "notifyReporter": true
}

Response (Success - 200):
{
  "message": "Report resolved"
}
```

#### PATCH /admin/reports/:reportId/dismiss
**Purpose**: Dismiss a report
```json
Request:
{
  "reason": "No violation found",
  "notes": "Content is within guidelines"
}

Response (Success - 200):
{
  "message": "Report dismissed"
}
```

## 6. Analytics Services

### 6.1 Dashboard Metrics

#### GET /admin/analytics/dashboard
**Purpose**: Get key metrics for dashboard
```json
Response (Success - 200):
{
  "users": {
    "total": 1250,
    "active": 456,
    "newToday": 12,
    "trend": "+5.2%"
  },
  "reviews": {
    "total": 3420,
    "pending": 23,
    "flagged": 8,
    "todayCount": 34
  },
  "reports": {
    "open": 15,
    "inReview": 8,
    "critical": 2
  },
  "systemHealth": {
    "status": "healthy",
    "uptime": "99.9%",
    "avgResponseTime": "120ms",
    "errorRate": "0.1%"
  }
}
```

### 6.2 User Analytics

#### GET /admin/analytics/users
**Purpose**: Get detailed user analytics
```
Query Parameters:
- period: enum (today, week, month, year, custom)
- startDate, endDate: ISO dates (for custom period)

Response (Success - 200):
{
  "registrations": {
    "total": 1250,
    "byPeriod": [
      {"date": "2024-02-10", "count": 15},
      {"date": "2024-02-11", "count": 18},
      ...
    ]
  },
  "activeUsers": {
    "daily": 456,
    "weekly": 892,
    "monthly": 1102
  },
  "retention": {
    "week1": "85%",
    "week2": "72%",
    "month1": "65%"
  }
}
```

### 6.3 Content Analytics

#### GET /admin/analytics/content
**Purpose**: Get content-related analytics
```json
Response (Success - 200):
{
  "reviews": {
    "total": 3420,
    "averageRating": 3.8,
    "byPeriod": [...],
    "byDepartment": [
      {"department": "Computer Science", "count": 892, "avgRating": 4.1},
      ...
    ]
  },
  "topProfessors": [
    {
      "id": "prof_id",
      "name": "Dr. John Smith",
      "reviewCount": 145,
      "avgRating": 4.5
    },
    ...
  ],
  "topCourses": [...]
}
```

## 7. Settings & Configuration Services

### 7.1 System Settings

#### GET /admin/settings
**Purpose**: Get current system settings
```json
Response (Success - 200):
{
  "moderation": {
    "autoApproveReviews": false,
    "profanityFilterEnabled": true,
    "minReviewLength": 50,
    "maxReviewLength": 1000
  },
  "notifications": {
    "emailEnabled": true,
    "criticalAlertsEmail": "admin@mail.aub.edu",
    "notifyOnReport": true
  },
  "security": {
    "sessionTimeout": 1800,
    "mfaRequired": true,
    "ipWhitelistEnabled": false
  }
}
```

#### PATCH /admin/settings
**Purpose**: Update system settings
```json
Request:
{
  "moderation": {
    "autoApproveReviews": false,
    "profanityFilterEnabled": true
  }
}

Response (Success - 200):
{
  "message": "Settings updated successfully"
}
```

### 7.2 Admin Management

#### GET /admin/admins
**Purpose**: List all admin users
```json
Response (Success - 200):
{
  "data": [
    {
      "id": "admin_id",
      "email": "admin@mail.aub.edu",
      "role": "super_admin",
      "permissions": ["*"],
      "lastLogin": "2024-02-16T09:00:00Z",
      "createdAt": "2023-08-01T00:00:00Z"
    },
    ...
  ]
}
```

#### POST /admin/admins
**Purpose**: Add new admin user
```json
Request:
{
  "email": "newadmin@mail.aub.edu",
  "role": "moderator",
  "permissions": ["reviews.read", "reviews.moderate", "reports.manage"]
}

Response (Success - 201):
{
  "message": "Admin created successfully",
  "admin": {...}
}
```

## 8. Audit Logging

### 8.1 Audit Logs

#### GET /admin/audit-logs
**Purpose**: Retrieve audit logs
```
Query Parameters:
- page, perPage
- adminId: filter by admin user
- action: filter by action type
- resource: filter by resource type
- startDate, endDate: date range

Response (Success - 200):
{
  "data": [
    {
      "id": "log_id",
      "admin": {
        "id": "admin_id",
        "email": "admin@mail.aub.edu"
      },
      "action": "user_suspended",
      "resource": {
        "type": "user",
        "id": "user_id"
      },
      "details": {
        "reason": "Violation of guidelines",
        "duration": "7d"
      },
      "timestamp": "2024-02-16T10:30:00Z",
      "ipAddress": "10.0.1.50"
    },
    ...
  ],
  "pagination": {...}
}
```

## 9. Technical Implementation Requirements

### 9.1 Database Schema Requirements
- **Users Table**: Extend with status, suspension_expires_at
- **Reviews Table**: Add status, flag_count, moderation_history
- **Reports Table**: New table for user reports
- **Audit Logs Table**: New table for action logging
- **Admin Users Table**: Separate table for admin accounts
- **Admin Roles & Permissions Tables**: For RBAC

### 9.2 API Security
- **Authentication**: JWT tokens with refresh mechanism
- **Rate Limiting**: Implement on all admin endpoints
- **CORS**: Restrict to admin panel domain only
- **Input Validation**: Validate all inputs server-side
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize all user-generated content

### 9.3 Performance Optimization
- **Database Indexing**: Index frequently queried fields
- **Caching**: Redis for frequently accessed data
- **Pagination**: Implement cursor-based pagination for large datasets
- **Async Operations**: Use background jobs for heavy operations

### 9.4 Monitoring & Logging
- **Error Tracking**: Implement error tracking (e.g., Sentry)
- **Performance Monitoring**: Track API response times
- **Alert System**: Notify admins of critical issues
- **Log Retention**: Store logs for at least 1 year

## 10. API Documentation
- **OpenAPI/Swagger**: Generate interactive API documentation
- **Authentication Guide**: Document authentication flow
- **Rate Limiting Info**: Document rate limits per endpoint
- **Error Codes**: Document all possible error responses
- **Changelog**: Maintain API version changelog

## 11. Testing Requirements
- **Unit Tests**: Test all service functions
- **Integration Tests**: Test API endpoints
- **Security Tests**: Test authentication, authorization, injection attacks
- **Load Tests**: Test performance under load
- **Test Coverage**: Minimum 80% code coverage
