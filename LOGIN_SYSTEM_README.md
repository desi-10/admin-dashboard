# Login System Documentation

## Overview

A complete authentication system built with Next.js App Router, featuring a scalable features-based architecture, Shadcn UI components, and clean, junior-friendly code.

## Features

- ✅ Login page with username/password authentication
- ✅ Hardcoded credentials (easily extensible to database)
- ✅ Session management with HTTP-only cookies
- ✅ Protected routes using middleware
- ✅ Modern UI with Shadcn UI components
- ✅ React Icons and Material UI outline icons
- ✅ Features-based architecture for scalability
- ✅ TypeScript with full type safety
- ✅ Clean, well-documented code

## Demo Credentials

```
Username: admin
Password: admin123
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login page
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx              # Protected dashboard
│   ├── api/
│   │   └── features/
│   │       └── auth/
│   │           ├── login/route.ts    # Login API endpoint
│   │           └── logout/route.ts   # Logout API endpoint
│   ├── lib/
│   │   ├── auth.ts                   # Session utilities
│   │   ├── db.ts                     # Database connection
│   │   ├── extractor.ts              # Schema introspection
│   │   └── manager.ts                # DB manager
│   └── page.tsx                      # Root redirect page
├── features/
│   └── auth/
│       ├── services/
│       │   └── auth.service.ts       # Authentication logic
│       ├── components/
│       │   ├── login/
│       │   │   ├── LoginForm.tsx     # Login form component
│       │   │   └── LoginCard.tsx     # Login card wrapper
│       │   └── dashboard/
│       │       └── DashboardContent.tsx  # Dashboard content
│       └── types/
│           └── auth.types.ts         # Type definitions
├── components/
│   └── ui/                           # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
└── middleware.ts                     # Route protection
```

## How It Works

### 1. Authentication Flow

1. User visits `/` → redirected to `/login`
2. User enters credentials on login page
3. LoginForm calls `/api/features/auth/login`
4. Auth service validates credentials
5. If valid, session is created and stored in HTTP-only cookie
6. User is redirected to `/dashboard`

### 2. Session Management

Sessions are managed using HTTP-only cookies:

- **Creation**: `createSession(user)` generates a base64-encoded token
- **Validation**: `validateSession(token)` checks if session is valid/unexpired
- **Storage**: Secure HTTP-only cookies with SameSite protection
- **Duration**: 24 hours (configurable)

### 3. Route Protection

The middleware (`src/middleware.ts`) protects routes:

- Protected routes: `/dashboard/*`
- Public routes: `/login`, `/`
- Unauthenticated users → redirected to `/login`
- Authenticated users on `/login` → redirected to `/dashboard`

### 4. API Routes

**POST /api/features/auth/login**
- Request: `{ username: string, password: string }`
- Response: `{ success: boolean, message: string, user?: User }`
- Sets session cookie on success

**POST /api/features/auth/logout**
- Clears session cookie
- Response: `{ success: boolean, message: string }`

## Usage

### Running the Application

```bash
# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:3000
```

### Testing Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter credentials: `admin` / `admin123`
4. Click "Sign In"
5. You'll be redirected to `/dashboard`

### Logging Out

Click the "Logout" button in the dashboard header.

## Extending the System

### 1. Add Database Authentication

Replace hardcoded credentials with database lookup:

```typescript
// features/auth/services/auth.service.ts
import { getDB } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function loginWithDatabase(credentials: LoginCredentials): Promise<AuthResult> {
  const db = getDB(process.env.DATABASE_URL!);
  
  // 1. Query user from database
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("username", "=", credentials.username)
    .executeTakeFirst();
  
  if (!user) {
    return { success: false, message: "Invalid credentials" };
  }
  
  // 2. Compare hashed password
  const isValid = await bcrypt.compare(credentials.password, user.password_hash);
  
  if (!isValid) {
    return { success: false, message: "Invalid credentials" };
  }
  
  // 3. Return user data
  return {
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
    },
  };
}
```

### 2. Add JWT Sessions

Replace simple tokens with JWT:

```typescript
// app/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createJWTSession(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function validateJWTSession(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      createdAt: decoded.iat * 1000,
      expiresAt: decoded.exp * 1000,
    };
  } catch (error) {
    return null;
  }
}
```

### 3. Add Role-Based Access Control

```typescript
// features/auth/types/auth.types.ts
export interface User {
  id: string;
  username: string;
  role: "admin" | "user" | "viewer";  // Add role
}

// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSessionFromCookie(request);
  const user = session ? getUserFromSession(session) : null;
  
  // Check role for admin routes
  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  // ...rest of middleware
}
```

### 4. Add More Features

The features-based architecture makes it easy to add:

- `features/users/` - User management
- `features/database/` - Database CRUD operations
- `features/settings/` - Application settings
- `features/reports/` - Reporting functionality

Each feature follows the same structure:
- `services/` - Business logic
- `components/` - UI components
- `types/` - TypeScript types

## Security Considerations

### Current Implementation

- ✅ HTTP-only cookies (JavaScript cannot access)
- ✅ SameSite cookies (CSRF protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ Session expiration (24 hours)
- ✅ Input validation

### Production Recommendations

1. **Password Hashing**: Use bcrypt or argon2
2. **JWT Tokens**: Consider using JWT for stateless auth
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Add rate limiting to prevent brute force
5. **CSRF Tokens**: Add CSRF protection for forms
6. **Session Storage**: Store sessions in database for better control
7. **Password Policies**: Enforce strong passwords
8. **2FA**: Add two-factor authentication
9. **Audit Logging**: Log authentication events
10. **Environment Variables**: Use env vars for secrets

## Troubleshooting

### "Invalid username or password"

- Check credentials: `admin` / `admin123`
- Ensure no extra spaces

### "Unable to connect"

- Check if dev server is running
- Verify API route is accessible
- Check browser console for errors

### Redirects not working

- Clear cookies and try again
- Check middleware configuration
- Verify session cookie is set

### Prisma WASM error

- The `next.config.ts` already has the fix
- Prisma internals are externalized
- Only use extractor in specific endpoints, not in every route

## Next Steps

1. Implement database-backed authentication
2. Add user registration
3. Implement password reset flow
4. Add role-based access control
5. Build out dashboard features
6. Add database CRUD operations UI
7. Implement audit logging
8. Add 2FA support

## Resources

- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Kysely](https://kysely.dev/)

## Support

For questions or issues:
1. Check the inline code documentation
2. Review the extensibility examples in service files
3. Refer to this README
4. Check Next.js and Shadcn UI documentation

