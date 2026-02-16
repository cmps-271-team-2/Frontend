# Admin Panel Requirements & Specifications

## Overview
This document outlines the requirements for the AUB Rate Admin Panel, a comprehensive administrative interface for managing the university rating system.

## 1. Core Requirements

### 1.1 User Management
- **View All Users**: Display paginated list of all registered users with filters
- **User Details**: View comprehensive user information including:
  - Email, registration date, verification status
  - Total number of ratings/reviews submitted
  - Account status (active, suspended, banned)
  - Last login timestamp
- **User Moderation Actions**:
  - Suspend user accounts (temporary ban)
  - Permanently ban users
  - Unsuspend/unban users
  - Delete user accounts and associated data
  - Send warning notifications to users
- **Search & Filtering**:
  - Search users by email, name, or ID
  - Filter by account status
  - Filter by registration date range
  - Sort by various fields (registration date, activity level)

### 1.2 Content Moderation
- **Review Management**:
  - View all submitted reviews/ratings
  - Filter reviews by status (pending, approved, flagged, removed)
  - View flagged/reported reviews with report reasons
  - Approve or reject pending reviews
  - Remove inappropriate content
  - Edit reviews (with audit trail)
- **Professor/Course Management**:
  - Add new professors to the system
  - Edit professor information
  - Add new courses
  - Edit course information
  - Archive/unarchive professors/courses
  - Merge duplicate entries
- **Automated Content Filtering**:
  - Flag reviews containing profanity
  - Flag reviews with suspicious patterns
  - Flag spam or repeated content

### 1.3 Reports & Flagged Content
- **Report Queue**:
  - View all user reports in chronological order
  - Categorize reports (harassment, spam, inappropriate content, etc.)
  - Assign priority levels (low, medium, high, critical)
  - Track report status (open, in review, resolved, dismissed)
- **Report Actions**:
  - Investigate reported content
  - Take action on reported users/content
  - Respond to reporters with outcomes
  - Mark reports as resolved or dismissed
- **Report Analytics**:
  - Track most reported users
  - Track most common report types
  - Monitor resolution times

### 1.4 Analytics & Insights
- **User Analytics**:
  - Total registered users
  - Daily/weekly/monthly active users
  - New user registration trends
  - User retention rates
- **Content Analytics**:
  - Total reviews/ratings submitted
  - Average ratings by professor/course
  - Most reviewed professors/courses
  - Review submission trends over time
- **System Health**:
  - API response times
  - Error rates
  - Failed login attempts
  - System uptime

### 1.5 Settings & Configuration
- **System Settings**:
  - Configure email templates
  - Set review moderation rules
  - Configure auto-moderation thresholds
  - Manage announcement banners
- **Role Management**:
  - Define admin roles (super admin, moderator, support)
  - Assign permissions to roles
  - Manage admin user access
- **Notification Settings**:
  - Configure alert thresholds
  - Set up email notifications for admins
  - Configure SMS alerts for critical issues

## 2. User Interface Requirements

### 2.1 Layout
- **Sidebar Navigation**: Persistent left sidebar with:
  - Dashboard
  - Users
  - Reviews & Ratings
  - Reports
  - Professors & Courses
  - Analytics
  - Settings
- **Top Navigation Bar**:
  - Admin profile dropdown
  - Notifications bell icon
  - Quick search
  - Logout button
- **Responsive Design**: Mobile-friendly for tablet usage

### 2.2 Dashboard (Home)
- **Key Metrics Cards**:
  - Total users (with trend indicator)
  - Pending reviews
  - Unresolved reports
  - System health status
- **Recent Activity Feed**:
  - Latest user registrations
  - Recent reviews submitted
  - Recent reports filed
- **Quick Actions**:
  - Review pending content
  - Check flagged items
  - View critical reports

### 2.3 Data Tables
- **Standard Features for All Tables**:
  - Pagination (10, 25, 50, 100 items per page)
  - Column sorting (ascending/descending)
  - Advanced filtering
  - Bulk selection for batch operations
  - Export to CSV
  - Column customization (show/hide columns)
- **Search Functionality**:
  - Real-time search
  - Debounced input
  - Search across multiple fields

### 2.4 Forms & Modals
- **Form Validation**: Client-side validation with clear error messages
- **Confirmation Dialogs**: For destructive actions (delete, ban)
- **Toast Notifications**: Success/error feedback for actions

## 3. Security Requirements

### 3.1 Authentication & Authorization
- **Admin Authentication**:
  - Separate admin login flow
  - Multi-factor authentication (MFA) required
  - Admin email domain restriction (@aub.edu)
- **Role-Based Access Control (RBAC)**:
  - Super Admin: Full access to all features
  - Moderator: Access to content moderation only
  - Support: Read-only access to user data and reports
- **Session Management**:
  - 30-minute idle timeout
  - Secure session tokens
  - Force re-authentication for sensitive operations

### 3.2 Audit Logging
- **Action Logging**: Log all admin actions with:
  - Admin user ID and email
  - Timestamp
  - Action type
  - Affected resource (user ID, review ID, etc.)
  - Previous and new values (for edits)
- **Audit Trail**: Maintain immutable audit logs
- **Log Retention**: Keep logs for minimum 1 year

### 3.3 Data Protection
- **Sensitive Data**: Mask sensitive user information
- **Rate Limiting**: Prevent abuse of admin endpoints
- **IP Whitelisting**: Optional IP restriction for admin access

## 4. Performance Requirements

- **Page Load Time**: < 2 seconds for initial load
- **Data Fetching**: < 1 second for most API calls
- **Real-time Updates**: WebSocket or polling for notifications
- **Optimized Queries**: Pagination and lazy loading for large datasets
- **Caching**: Cache frequently accessed data (professors, courses)

## 5. Accessibility Requirements

- **WCAG 2.1 Level AA Compliance**:
  - Keyboard navigation support
  - Screen reader compatibility
  - Sufficient color contrast
  - Clear focus indicators
- **Semantic HTML**: Proper use of headings, landmarks
- **ARIA Labels**: For interactive elements

## 6. Technical Stack

### 6.1 Frontend (Current)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **State Management**: React hooks (useState, useContext)
- **Data Fetching**: Custom API fetch utility

### 6.2 Recommended Additional Libraries
- **UI Components**: 
  - shadcn/ui or Radix UI (accessible components)
  - Recharts or Chart.js (for analytics visualizations)
- **Tables**: 
  - TanStack Table (React Table v8) for advanced data tables
- **Forms**: 
  - React Hook Form with Zod validation
- **Date Handling**: 
  - date-fns for date formatting and manipulation

## 7. Future Enhancements

### 7.1 Phase 2 Features
- **Bulk Operations**: Import/export users and content
- **Advanced Analytics**: Custom report builder
- **Scheduled Tasks**: Automated content cleanup, weekly reports
- **Email Campaigns**: Send announcements to all users
- **API Keys**: Generate API keys for third-party integrations

### 7.2 Phase 3 Features
- **Machine Learning**: Auto-categorize reviews, detect sentiment
- **Advanced Reporting**: Customizable dashboards
- **Mobile App**: Native admin mobile application
- **Integration**: Connect with AUB's systems (Banner, Moodle)
