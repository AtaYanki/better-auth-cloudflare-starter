# Better Auth Cloudflare Starter

A production-ready full-stack starter template built on Cloudflare Workers, featuring secure authentication with Better Auth, payment processing, and modern development practices. Perfect for building scalable SaaS applications with enterprise-grade infrastructure.

## ✨ Features

### 🚀 Core Stack
- **TypeScript** - End-to-end type safety
- **TanStack Start** - Modern SSR framework with TanStack Router
- **TailwindCSS + shadcn/ui** - Beautiful, accessible UI components
- **Hono** - Lightning-fast server framework for Cloudflare Workers
- **tRPC** - Type-safe API layer with automatic client generation

### 🔐 Authentication & Security
- **Better Auth** - Complete authentication solution with OTP, email verification
- **Have I Been Pwned** integration - Password breach detection
- **Secure session management** - HTTP-only cookies with proper security headers
- **Email OTP flows** - Sign-in, email verification, and password reset
- **API Rate Limiting** - Tier-based rate limiting (authenticated/unauthenticated/paid users)
- **Multi-tenant Support** - Full organization and team management with invitations

### 💳 Payments & Subscriptions
- **Polar.sh** integration - Modern payment processing
- **Customer portal** - Self-service subscription management
- **Checkout flows** - Seamless payment integration
- **Usage-based billing** ready

### 📧 Communication
- **Resend** - Transactional email delivery
- **Custom email templates** - Professional, branded communications
- **Email verification** - Secure user onboarding flow

### 🗄️ Database & Storage
- **Neon Database** - Serverless PostgreSQL with auto-scaling
- **Drizzle ORM** - Type-safe database operations
- **Cloudflare R2** - Type-safe bucket service with automatic type extraction

### 🏗️ Developer Experience
- **Turborepo** - Optimized monorepo build system
- **Hot reload** - Fast development with instant feedback
- **Type checking** - Comprehensive TypeScript validation
- **Database migrations** - Safe schema updates with Drizzle

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun**
- **PostgreSQL database** (we recommend [Neon](https://neon.tech))
- **Cloudflare account** for deployment
- **Resend account** for transactional emails
- **Polar.sh account** for payments

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd better-auth-cloudflare-starter
   bun install
   ```

2. **Set up your database:**
   - Create a [Neon](https://neon.tech) database
   - Copy your connection string

3. **Configure environment variables:**

   Copy the example environment files and fill in your values:

   ```bash
   # Copy example files
   cp apps/server/.env.example apps/server/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Then edit the `.env` files with your actual values:

   ```bash
   # apps/server/.env
   DATABASE_URL="postgresql://user:password@host/database"
   BETTER_AUTH_SECRET="your-super-secret-key"  # Generate with: openssl rand -base64 32
   BETTER_AUTH_URL="http://localhost:3000"
   CORS_ORIGIN="http://localhost:3001"
   RESEND_API_KEY="re_your-resend-key"
   POLAR_ACCESS_TOKEN="polar_access_token"
   POLAR_SUCCESS_URL="http://localhost:3001/success"

   # apps/web/.env
   VITE_SERVER_URL="http://localhost:3000"
   ```

   **Generate a secure `BETTER_AUTH_SECRET`:**
   ```bash
   openssl rand -base64 32
   # or
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Set up the database:**
   ```bash
   bun run db:push
   ```

5. **Start development servers:**
   ```bash
   bun run dev
   ```

   - 🌐 **Web App**: [http://localhost:3001](http://localhost:3001)
   - 🚀 **API Server**: [http://localhost:3000](http://localhost:3000)

### 🧪 Testing Authentication

Visit the web app and try:
- **Sign up** with email verification
- **Sign in** with OTP codes
- **Password reset** flow
- **Profile management**

## 🚀 Quick Start (Minimal Setup)

If you want to get started quickly without setting up all external services, you can run with minimal configuration:

### Minimal Prerequisites

- **Node.js 18+** or **Bun**
- **PostgreSQL database** (local or [Neon](https://neon.tech))
- **Cloudflare account** (for deployment only)

### Minimal Configuration

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd better-auth-cloudflare-starter
   bun install
   ```

2. **Set up minimal environment:**

   ```bash
   # apps/server/.env (minimal)
   DATABASE_URL="postgresql://user:password@host/database"
   BETTER_AUTH_SECRET="your-super-secret-key"  # Generate with: openssl rand -base64 32
   BETTER_AUTH_URL="http://localhost:3000"
   CORS_ORIGIN="http://localhost:3001"
   
   # Optional: Mock email (emails will be logged to console)
   RESEND_API_KEY="re_placeholder"
   
   # Optional: Skip Polar setup (payment features will be disabled)
   # POLAR_ACCESS_TOKEN=""
   # POLAR_SUCCESS_URL=""

   # apps/web/.env (minimal)
   VITE_SERVER_URL="http://localhost:3000"
   ```

3. **Set up database:**
   ```bash
   bun run db:push
   ```

4. **Start development:**
   ```bash
   bun run dev
   ```

### What Works Without External Services

✅ **Authentication** - Email/password and OTP flows work  
✅ **Database** - All CRUD operations  
✅ **API Routes** - tRPC endpoints function normally  
✅ **UI Components** - All frontend features work  
✅ **Rate Limiting** - Works with default limits (configured in `wrangler.jsonc`)  
⚠️ **Email** - Emails logged to console (check server logs)  
⚠️ **Payments** - Payment features disabled (tier checks will default to free)  

### Enabling Features Later

**To enable email sending:**
1. Sign up for [Resend](https://resend.com)
2. Add `RESEND_API_KEY` to `apps/server/.env`
3. Restart the server

**To enable payments:**
1. Sign up for [Polar.sh](https://polar.sh)
2. Create a product
3. Add `POLAR_ACCESS_TOKEN` and `POLAR_PRO_PRODUCT_ID` to `apps/server/.env`
4. Update `apps/web/.env` with `VITE_POLAR_PRO_PRODUCT_ID`
5. Restart both servers

### Mock Email Behavior

When `RESEND_API_KEY` is not set or is a placeholder:
- Email templates are rendered but not sent
- Email content is logged to the server console
- You can copy verification links from the logs
- All auth flows work normally for testing



## 🏗️ Architecture

```
better-auth-cloudflare-starter/
├── apps/
│   ├── web/              # React SPA with TanStack Start
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── routes/      # Page routes
│   │   │   └── lib/         # Client-side utilities
│   │   └── public/          # Static assets
│   └── server/           # Cloudflare Workers API
│       └── src/          # Hono + tRPC server
├── packages/
│   ├── api/             # Shared API logic
│   ├── auth/            # Better Auth configuration
│   ├── better-auth-ui/  # Custom auth components
│   ├── db/              # Database schema & queries
│   ├── transactional/   # Email templates
│   └── config/          # Shared TypeScript config
└── turbo.json          # Monorepo configuration
```

### Key Technologies

- **Frontend**: React + TanStack Start + TailwindCSS
- **Backend**: Hono (Cloudflare Workers) + tRPC
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better Auth with custom UI components
- **Payments**: Polar.sh integration
- **Email**: Resend for transactional emails

## 🚀 Deployment

### Cloudflare Workers Setup

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   wrangler auth login
   ```

3. **Configure production environment:**

   Update your environment variables for production:

   ```bash
   # apps/web/.env
   SERVER_URL=https://your-api.your-subdomain.workers.dev

   # apps/server/.env
   BETTER_AUTH_URL=https://your-api.your-subdomain.workers.dev
   CORS_ORIGIN=https://your-web.your-subdomain.workers.dev
   POLAR_SUCCESS_URL=https://your-web.your-subdomain.workers.dev/success
   ```

4. **Enable cookie settings for production:**

   In `packages/auth/src/index.ts`, uncomment and configure:

   ```typescript
   session: {
     cookieCache: {
       enabled: true,
       maxAge: 60,
     },
   },
   advanced: {
     crossSubDomainCookies: {
       enabled: true,
       domain: "your-subdomain.workers.dev",
     },
   },
   ```

5. **Deploy:**

   ```bash
   # Deploy API server
   cd apps/server && bun run deploy

   # Deploy web app (if using Cloudflare Pages)
   cd apps/web && bun run build && wrangler pages deploy dist
   ```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Random 32-character string | `your-super-secret-key` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `POLAR_ACCESS_TOKEN` | Polar.sh access token | `polar_...` |
| `CORS_ORIGIN` | Frontend domain for CORS | `https://app.workers.dev` |


## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all applications in development |
| `bun run build` | Build all applications for production |
| `bun run dev:web` | Start only the web application |
| `bun run dev:server` | Start only the API server |
| `bun run check-types` | Run TypeScript type checking |
| `bun run db:push` | Push database schema changes |
| `bun run db:studio` | Open Drizzle Studio for database management |
| `bun run db:generate` | Generate database migration files |
| `bun run db:migrate` | Run pending database migrations |

### Development Workflow

1. **Make schema changes:** Update files in `packages/db/src/schema/`
2. **Generate migrations:** `bun run db:generate`
3. **Apply to database:** `bun run db:push`
4. **Test locally:** `bun run dev`
5. **Deploy:** Follow deployment steps above

## 🎨 Customization

### Architecture Patterns

This starter uses several architectural patterns for maintainability and scalability:

- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic with tier-based limits
- **Service Locator** - Centralized service management
- **Type-Safe Bucket Service** - Cloudflare R2 integration

📖 **See [PATTERNS.md](./PATTERNS.md) for detailed documentation** on:
- How to create new repositories and services
- Implementing tier-based feature limits
- Using the bucket service for file storage
- Complete examples and best practices

### Styling
- **Theme**: Modify `apps/web/src/components/theme-provider.tsx`
- **Colors**: Update Tailwind config in `apps/web/tailwind.config.ts`
- **Components**: Customize shadcn/ui components in `apps/web/src/components/ui/`

### Authentication
- **Email templates**: Edit templates in `packages/transactional/emails/`
- **Auth flows**: Modify configuration in `packages/auth/src/index.ts`
- **UI components**: Customize auth components in `packages/better-auth-ui/`

### Payments
- **Products**: Update Polar product configuration in:
  - `packages/auth/src/lib/polar-products.ts` (server)
  - `apps/web/src/lib/polar-products.ts` (web app)
- **Product ID**: Set via `POLAR_PRO_PRODUCT_ID` env var or update defaults in config files
- **Pricing**: Modify checkout flows and success URLs in `packages/auth/src/index.ts`

### Multi-tenant & Organizations
- **Configuration**: Organization plugin is configured in `packages/auth/src/index.ts`
- **Features**:
  - ✅ Organization creation and management
  - ✅ Team management within organizations
  - ✅ Member roles (owner, admin, member)
  - ✅ Email-based invitations with verification
  - ✅ Organization switcher in header
  - ✅ Active organization/team tracking in sessions
- **UI Components**: 
  - Organization routes: `apps/web/src/routes/__authenticated/organization/$path.tsx`
  - Accept invitation: `apps/web/src/routes/accept-invitation.tsx`
  - Organization switcher: Integrated in header component
- **Customization**: 
  - Modify organization settings in `packages/auth/src/index.ts`:
    ```typescript
    organization({
      teams: { enabled: true },
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async (data) => { /* custom email */ }
    })
  ```
  - Customize invitation email template: `packages/transactional/emails/organization-invite-email.tsx`

### Rate Limiting
- **Configuration**: Rate limiters are configured in `apps/server/wrangler.jsonc`
- **Tiers**: 
  - `UNAUTHENTICATED_RATE_LIMITER` - For unauthenticated users (default: 100 requests/60s)
  - `AUTHENTICATED_RATE_LIMITER` - For authenticated users (default: 1000 requests/60s)
- **Customization**: Update limits in `wrangler.jsonc`:
  ```jsonc
  "ratelimits": [
    {
      "name": "UNAUTHENTICATED_RATE_LIMITER",
      "namespace_id": "1001",
      "simple": { "limit": 100, "period": 60 }  // 100 requests per 60 seconds
    },
    {
      "name": "AUTHENTICATED_RATE_LIMITER",
      "namespace_id": "1002",
      "simple": { "limit": 1000, "period": 60 }  // 1000 requests per 60 seconds
    }
  ]
  ```
- **How it works**: 
  - Rate limiting is applied automatically based on authentication status
  - Authenticated users get higher limits
  - Paid/Pro users can be given even higher limits (configure in rate limiter binding)
  - Rate limit keys use user ID for authenticated users, IP address for unauthenticated

## 🗺️ Roadmap

### Planned Features
- [x] **Cloudflare R2 Integration** - Type-safe bucket service with automatic type extraction ✅
- [x] **API Rate Limiting** - Request throttling and abuse prevention with tier-based limits ✅
- [x] **Multi-tenant Support** - Full organization and team management with invitations ✅
- [ ] **Audit Logs** - User activity tracking and compliance
- [ ] **Admin Dashboard** - User management and analytics
- [ ] **Webhook Support** - Integration with external services
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - User behavior and conversion tracking

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure your `DATABASE_URL` is correct and includes SSL parameters if needed
- For Neon: Make sure to use the connection string with SSL mode enabled
- Check that your database is accessible from your IP (Neon allows all by default)

### Authentication Not Working
- Verify `BETTER_AUTH_SECRET` is set and at least 32 characters long
- Ensure `BETTER_AUTH_URL` matches your server URL exactly
- Check that `CORS_ORIGIN` matches your web app URL exactly

### Email Not Sending
- Verify `RESEND_API_KEY` is correct and has proper permissions
- Check Resend dashboard for email delivery status
- Ensure sender email is verified in Resend

### Polar Payment Issues
- Verify `POLAR_ACCESS_TOKEN` is correct
- Check that product ID matches in both server and web configs
- Ensure `POLAR_SUCCESS_URL` is accessible

### Port Already in Use
- Change ports in `wrangler.jsonc` files if 3000/3001 are taken
- Update environment variables accordingly

### Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - Authentication framework
- [Polar.sh](https://polar.sh) - Payment processing
- [Resend](https://resend.com) - Email delivery
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge runtime
- [TanStack](https://tanstack.com) - Modern React tools

---

Built with ❤️ using modern web technologies. Ready for production, built for scale.
