# Zero-to-Hero Waste Management - Admin Portal

## Overview

Zero-to-Hero is a waste management platform that connects citizens with waste collection services while incentivizing proper waste disposal through a rewards system. The application enables users to report waste locations, track collections, and earn rewards, while administrators manage the entire ecosystem through a comprehensive admin portal.

The platform features a public-facing homepage showcasing impact statistics and an admin dashboard for managing users, reports, rewards, transactions, and notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast refresh and optimized builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- shadcn/ui component library (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Poppins font family (300, 400, 500, 600, 700 weights) for typography
- Green-themed, eco-friendly color palette with neutral accents
- Responsive design with mobile-first approach

**State Management Strategy**
- React Query for server state (data fetching, caching, mutations)
- React Context for authentication state (AuthContext)
- Local state with useState/useReducer for component-level state
- LocalStorage for persisting admin authentication tokens

**Design System**
- Custom color system with HSL-based CSS variables for theming
- Consistent spacing scale (4, 6, 8, 10, 12, 16, 20px units)
- Status color conventions: yellow (pending), green (approved/collected), red (rejected)
- Elevation system with hover and active states for interactive elements
- Border radius system: 9px (lg), 6px (md), 3px (sm)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- HTTP server architecture with RESTful API design
- Middleware stack: JSON parsing, URL encoding, request logging

**API Design Pattern**
- RESTful endpoints organized by resource type
- Centralized route registration in `server/routes.ts`
- Consistent error handling with try-catch blocks
- JSON responses with appropriate HTTP status codes

**Authentication & Authorization**
- bcrypt.js for password hashing (10 salt rounds)
- Session-based authentication stored in localStorage (client-side)
- Admin-specific routes protected by authentication checks
- Default admin seeded on server startup (mrrameez32@gmail.com)

**Request/Response Flow**
1. Client makes API request through React Query
2. Express middleware processes request (logging, parsing)
3. Route handler validates input with Zod schemas
4. Storage layer executes database operations
5. Response sent with appropriate status and data
6. React Query caches and updates UI state

### Data Storage Solutions

**Database Technology**
- PostgreSQL via Neon Database (serverless)
- Drizzle ORM for type-safe database queries
- Connection pooling with @neondatabase/serverless
- WebSocket support for real-time database connections

**Schema Design**
- **users**: User accounts (id, email, name, timestamps)
- **admins**: Administrator accounts (id, email, password hash, name)
- **reports**: Waste reports (id, userId, location, wasteType, amount, imageUrl, verificationResult, status, collectorId, timestamps)
- **rewards**: User rewards and levels (id, userId, points, level, name, description, collectionInfo, isAvailable, timestamps)
- **transactions**: Point transactions (id, userId, points, type, description, timestamps)
- **notifications**: User notifications (id, userId, title, message, type, isRead, timestamps)
- **collectedWastes**: Collection records (id, reportId, collectorId, collectionDate, status)

**Data Access Layer**
- Storage interface (IStorage) defines contract for all data operations
- Drizzle ORM queries with type inference from schema
- Relational queries using Drizzle's query API
- Support for bulk operations (createBulkNotifications)

**Migration Strategy**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Schema definitions in `shared/schema.ts` for type sharing
- Database push command: `npm run db:push`

### External Dependencies

**UI Component Libraries**
- @radix-ui/* packages (v1.x): Accessible, unstyled component primitives
- class-variance-authority: Type-safe component variant management
- cmdk: Command palette component
- lucide-react: Icon library
- react-day-picker: Date picker component
- embla-carousel-react: Carousel component
- vaul: Drawer component
- input-otp: OTP input component

**Form Management**
- react-hook-form: Form state and validation
- @hookform/resolvers: Validation resolver integration
- zod: Schema validation library
- drizzle-zod: Zod schema generation from Drizzle schemas

**Database & ORM**
- @neondatabase/serverless: PostgreSQL serverless driver
- drizzle-orm: TypeScript ORM with SQL-like syntax
- drizzle-kit: Migration and introspection toolkit
- ws: WebSocket client for database connections

**Backend Utilities**
- bcryptjs: Password hashing and verification
- express-session: Session middleware
- connect-pg-simple: PostgreSQL session store
- date-fns: Date manipulation library
- nanoid: Unique ID generation

**Development Tools**
- @replit/vite-plugin-*: Replit-specific development plugins
- tsx: TypeScript execution for Node.js
- esbuild: Fast JavaScript bundler for production builds
- tailwindcss & autoprefixer: CSS processing

**Build Process**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles TypeScript to `dist/index.cjs`
- Allowlist bundling strategy for specific dependencies to reduce syscalls
- Separate build scripts for client and server

**Environment Variables**
- DATABASE_URL: PostgreSQL connection string (required)
- NODE_ENV: Environment mode (development/production)