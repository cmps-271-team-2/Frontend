# Admin Panel Implementation Guide

## Overview

This admin panel framework provides a comprehensive administrative interface for the AUB Rate application. It includes authentication, user management, content moderation, reporting, and analytics capabilities.

## Project Structure

```
src/
├── app/admin/                      # Admin routes
│   ├── layout.tsx                  # Admin root layout with auth provider
│   ├── login/                      # Admin login page
│   ├── dashboard/                  # Main dashboard
│   ├── users/                      # User management
│   ├── reviews/                    # Review moderation
│   ├── reports/                    # Reports management
│   ├── professors/                 # Professor management
│   ├── courses/                    # Course management
│   ├── analytics/                  # Analytics & insights
│   └── settings/                   # Admin settings
├── components/admin/               # Admin-specific components
│   ├── layout/
│   │   └── AdminLayout.tsx         # Main admin layout with sidebar
│   ├── ui/
│   │   └── Components.tsx          # Reusable UI components
│   └── tables/
│       └── DataTable.tsx           # Data table component
├── lib/admin/                      # Admin utilities
│   ├── types.ts                    # TypeScript type definitions
│   ├── api.ts                      # Admin API functions
│   └── auth-context.tsx            # Authentication context
└── docs/                           # Documentation
    ├── ADMIN_PANEL_REQUIREMENTS.md # Detailed requirements
    └── BACKEND_SERVICES.md         # Backend API specifications
```

## Getting Started

### 1. Prerequisites

The admin panel is built on the existing Next.js application with:
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Auth

### 2. Access the Admin Panel

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the admin login page:
```
http://localhost:3000/admin/login
```

3. **Demo Credentials** (for development):
   - Email: Any valid @mail.aub.edu email
   - Password: Any password with 8+ characters

   *Note: This is a mock authentication for demonstration. In production, this must be replaced with actual admin authentication.*

### 3. Navigate the Admin Panel

After logging in, you'll see the dashboard with:
- **Dashboard**: Overview of key metrics and system health
- **Users**: User management and moderation
- **Reviews**: Content moderation for reviews and ratings
- **Reports**: Manage user reports and flagged content
- **Professors**: Add and manage professor profiles
- **Courses**: Add and manage course information
- **Analytics**: View detailed analytics and insights
- **Settings**: Configure system settings

## Features Implemented

### ✅ Core Framework
- [x] Admin route structure (`/admin/*`)
- [x] Admin authentication context
- [x] Protected routes with authentication check
- [x] Responsive admin layout with sidebar navigation
- [x] Top navigation bar with notifications and search

### ✅ UI Components
- [x] Reusable UI components (Card, Button, Badge, Input, Select, Modal)
- [x] Data table with pagination, sorting, and filtering
- [x] Loading states and empty states
- [x] Status badges for different states

### ✅ Pages
- [x] Admin login page
- [x] Dashboard with key metrics
- [x] User management page (example)

### ✅ Documentation
- [x] Comprehensive requirements document
- [x] Backend services specification
- [x] API endpoint documentation
- [x] Implementation guide

## Connecting to Backend

### Current State
The admin panel currently uses **mock data** for demonstration purposes. All API calls return simulated data.

### Integration Steps

To connect the admin panel to a real backend:

1. **Configure Backend URL**:
   
   Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
   ```

2. **Implement Admin Authentication**:

   Update `src/lib/admin/auth-context.tsx` to call the real login API:
   ```typescript
   const login = async (email: string, password: string) => {
     const response = await adminLogin(email, password);
     setAdmin(response.user);
     localStorage.setItem("admin_user", JSON.stringify(response.user));
     localStorage.setItem("admin_token", response.token);
   };
   ```

3. **Add JWT Token to API Requests**:

   Update `src/lib/api.ts` to include the admin token:
   ```typescript
   const token = localStorage.getItem("admin_token");
   headers: {
     "Content-Type": "application/json",
     "Authorization": `Bearer ${token}`,
     ...(options.headers || {}),
   }
   ```

4. **Replace Mock Data**:

   In each page (e.g., `src/app/admin/users/page.tsx`), replace mock data with API calls:
   ```typescript
   // Instead of mock data:
   const response = await getUsers({ page, perPage, search, status: statusFilter });
   setUsers(response.data);
   ```

5. **Implement Error Handling**:

   Add proper error handling for API failures:
   ```typescript
   try {
     const response = await getUsers(params);
     setUsers(response.data);
   } catch (error) {
     setError("Failed to load users");
     console.error(error);
   }
   ```

## Backend Requirements

The backend must implement the API endpoints specified in `docs/BACKEND_SERVICES.md`. Key requirements:

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- MFA support for admin users
- Session management with 30-minute timeout

### Database Schema
Required tables:
- **admin_users**: Admin account information and roles
- **users**: Extended with status, suspension fields
- **reviews**: Extended with moderation status, flags
- **reports**: New table for user reports
- **audit_logs**: Track all admin actions
- **admin_roles & permissions**: For RBAC implementation

### Security
- Rate limiting on all admin endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Audit logging for all actions

## Development Guidelines

### Adding New Pages

1. Create a new directory under `src/app/admin/[feature]`
2. Add a `page.tsx` file with the page component
3. Wrap content with `<AdminLayout>`
4. Add authentication check using `useAdminAuth`

Example:
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import AdminLayout from "@/components/admin/layout/AdminLayout";

export default function NewFeaturePage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <AdminLayout>
      {/* Your page content */}
    </AdminLayout>
  );
}
```

### Adding API Functions

Add new API functions to `src/lib/admin/api.ts`:

```typescript
export async function newApiFunction(params: any) {
  return apiFetch<ResponseType>("/admin/endpoint", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
```

### Creating Custom Components

Add reusable components to `src/components/admin/ui/` or create feature-specific components in the feature directory.

## Security Considerations

### Authentication
- Never store sensitive data in localStorage in production
- Use secure, httpOnly cookies for authentication tokens
- Implement token refresh mechanism
- Add session timeout

### Authorization
- Verify permissions on every API request
- Implement row-level security
- Use principle of least privilege
- Audit all admin actions

### Data Protection
- Mask sensitive user information
- Encrypt sensitive data at rest
- Use HTTPS for all API calls
- Implement rate limiting

## Testing

### Manual Testing Checklist
- [ ] Login with valid and invalid credentials
- [ ] Navigation between all admin pages
- [ ] Data table pagination, sorting, filtering
- [ ] Forms validation and submission
- [ ] Logout functionality
- [ ] Session timeout
- [ ] Responsive design on different screen sizes

### Automated Testing
Add tests for:
- Admin authentication flow
- API functions
- Component rendering
- Form validation
- Table functionality

## Deployment

### Environment Variables
Required for production:
```env
NEXT_PUBLIC_BACKEND_URL=https://api.production.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase config
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Security Checklist
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MFA for all admins
- [ ] Configure IP whitelisting (optional)
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Regular security audits

## Next Steps

### Immediate (Phase 1)
1. Connect to backend API
2. Implement real authentication
3. Complete remaining pages (reviews, reports, etc.)
4. Add form validation for all forms
5. Implement error handling

### Short-term (Phase 2)
1. Add real-time notifications
2. Implement advanced filtering
3. Add bulk operations
4. Create export functionality
5. Add analytics visualizations

### Long-term (Phase 3)
1. Implement ML-based content moderation
2. Add custom reporting tools
3. Create mobile admin app
4. Integrate with AUB systems
5. Add advanced analytics

## Support & Resources

- **Requirements**: See `docs/ADMIN_PANEL_REQUIREMENTS.md`
- **Backend API**: See `docs/BACKEND_SERVICES.md`
- **Main README**: See root `README.md`

## Contributing

When adding new features:
1. Follow the existing code structure
2. Use TypeScript types from `src/lib/admin/types.ts`
3. Add proper error handling
4. Update documentation
5. Test thoroughly before committing

## License

This admin panel is part of the AUB Rate application and follows the same license.
