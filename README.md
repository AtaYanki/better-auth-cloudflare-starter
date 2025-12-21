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
- **Cloudflare R2** - Global object storage for user uploads (planned)

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
   cd authedge
   bun install
   ```

2. **Set up your database:**
   - Create a [Neon](https://neon.tech) database
   - Copy your connection string

3. **Configure environment variables:**

   Create `.env` files in both `apps/web/` and `apps/server/`:

   ```bash
   # apps/server/.env
   DATABASE_URL="postgresql://user:password@host/database"
   BETTER_AUTH_SECRET="your-super-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   CORS_ORIGIN="http://localhost:3001"
   RESEND_API_KEY="re_your-resend-key"
   POLAR_ACCESS_TOKEN="polar_access_token"
   POLAR_SUCCESS_URL="http://localhost:3001/success"

   # apps/web/.env
   SERVER_URL="http://localhost:3000"
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

### Styling
- **Theme**: Modify `apps/web/src/components/theme-provider.tsx`
- **Colors**: Update Tailwind config in `apps/web/tailwind.config.ts`
- **Components**: Customize shadcn/ui components in `apps/web/src/components/ui/`

### Authentication
- **Email templates**: Edit templates in `packages/transactional/emails/`
- **Auth flows**: Modify configuration in `packages/auth/src/index.ts`
- **UI components**: Customize auth components in `packages/better-auth-ui/`

### Payments
- **Products**: Update Polar product configuration in `packages/auth/src/index.ts`
- **Pricing**: Modify checkout flows and success URLs

## 🗺️ Roadmap

### Planned Features
- [ ] **Cloudflare R2 Integration** - User avatar uploads and file storage
- [ ] **Multi-tenant Support** - Organization/account management
- [ ] **API Rate Limiting** - Request throttling and abuse prevention
- [ ] **Audit Logs** - User activity tracking and compliance
- [ ] **Admin Dashboard** - User management and analytics
- [ ] **Webhook Support** - Integration with external services
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - User behavior and conversion tracking

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
