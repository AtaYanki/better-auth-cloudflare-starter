import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  CreditCard,
  Mail,
  Database,
  ExternalLink,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import {
  siGithub,
  siHono,
  siResend,
  siTailwindcss,
  siTrpc,
  siCloudflare,
  siDrizzle,
  siBun,
  siTanstack,
  siReact,
  siTypescript,
  siBetterauth,
  siTurborepo,
} from "simple-icons";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import SimpleIcon from "@/components/simple-icon";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Production-Ready Starter
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Better Auth Cloudflare Starter
          </h1>
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            A production-ready full-stack starter template built on Cloudflare
            Workers, featuring secure authentication with Better Auth, payment
            processing, and modern development practices. Perfect for building
            scalable SaaS applications with enterprise-grade infrastructure.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <SimpleIcon icon={siGithub} className="mr-2 h-4 w-4" />
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Stack Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                🚀 Core Stack
              </h2>
              <p className="text-lg text-muted-foreground">
                Built with modern technologies for optimal developer experience
                and performance
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siTypescript}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>TypeScript</CardTitle>
                  <CardDescription>
                    End-to-end type safety across your entire application
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siTanstack}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>TanStack Start</CardTitle>
                  <CardDescription>
                    Modern SSR framework with TanStack Router for fast,
                    interactive experiences
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siTailwindcss}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>TailwindCSS + shadcn/ui</CardTitle>
                  <CardDescription>
                    Beautiful, accessible UI components with consistent design
                    system
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siHono}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>Hono</CardTitle>
                  <CardDescription>
                    Lightning-fast server framework optimized for Cloudflare
                    Workers
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siTrpc}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>tRPC</CardTitle>
                  <CardDescription>
                    Type-safe API layer with automatic client generation
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication & Security Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                🔐 Authentication & Security
              </h2>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade security with modern authentication flows
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siBetterauth}
                    className="mb-2 h-8 w-8 text-primary"
                  />
                  <CardTitle>Better Auth</CardTitle>
                  <CardDescription>
                    Complete authentication solution with OTP, email
                    verification, and secure session management
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Have I Been Pwned</CardTitle>
                  <CardDescription>
                    Password breach detection to protect user accounts
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Secure Sessions</CardTitle>
                  <CardDescription>
                    HTTP-only cookies with proper security headers and session
                    management
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Mail className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Email OTP Flows</CardTitle>
                  <CardDescription>
                    Sign-in, email verification, and password reset with secure
                    OTP codes
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Payments & Communication Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Payments */}
              <div>
                <h3 className="mb-6 text-2xl font-bold md:text-3xl">
                  💳 Payments & Subscriptions
                </h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CreditCard className="mb-2 h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">
                        Polar.sh Integration
                      </CardTitle>
                      <CardDescription>
                        Modern payment processing with subscription management
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CheckCircle className="mb-2 h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Customer Portal</CardTitle>
                      <CardDescription>
                        Self-service subscription management for your users
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <ArrowRight className="mb-2 h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Checkout Flows</CardTitle>
                      <CardDescription>
                        Seamless payment integration with success handling
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="mb-6 text-2xl font-bold md:text-3xl">
                  📧 Communication
                </h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siResend}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Resend</CardTitle>
                      <CardDescription>
                        Transactional email delivery with high deliverability
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siReact}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">
                        Custom Email Templates
                      </CardTitle>
                      <CardDescription>
                        Professional, branded communications for all user
                        interactions
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Shield className="mb-2 h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">
                        Email Verification
                      </CardTitle>
                      <CardDescription>
                        Secure user onboarding flow with email verification
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database & Developer Experience Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Database & Storage */}
              <div>
                <h3 className="mb-6 text-2xl font-bold md:text-3xl">
                  🗄️ Database & Storage
                </h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <Database className="mb-2 h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Neon Database</CardTitle>
                      <CardDescription>
                        Serverless PostgreSQL with auto-scaling and high
                        availability
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siDrizzle}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Drizzle ORM</CardTitle>
                      <CardDescription>
                        Type-safe database operations with excellent developer
                        experience
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siCloudflare}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Cloudflare R2</CardTitle>
                      <CardDescription>
                        Global object storage for user uploads and file
                        management
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Developer Experience */}
              <div>
                <h3 className="mb-6 text-2xl font-bold md:text-3xl">
                  🏗️ Developer Experience
                </h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siTurborepo}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Turborepo</CardTitle>
                      <CardDescription>
                        Optimized monorepo build system for fast development
                        cycles
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siBun}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Hot Reload</CardTitle>
                      <CardDescription>
                        Fast development with instant feedback and hot module
                        replacement
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SimpleIcon
                        icon={siTypescript}
                        className="mb-2 h-6 w-6 text-primary"
                      />
                      <CardTitle className="text-lg">Type Checking</CardTitle>
                      <CardDescription>
                        Comprehensive TypeScript validation across the entire
                        codebase
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                🏗️ Architecture
              </h2>
              <p className="text-lg text-muted-foreground">
                Modern monorepo architecture designed for scalability
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                  {`better-auth-cloudflare-starter/
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
└── turbo.json          # Monorepo configuration`}
                </pre>
              </CardContent>
            </Card>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siTanstack}
                    className="mb-2 h-6 w-6 text-primary"
                  />
                  <CardTitle>Frontend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    React + TanStack Start + TailwindCSS
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siHono}
                    className="mb-2 h-6 w-6 text-primary"
                  />
                  <CardTitle>Backend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hono (Cloudflare Workers) + tRPC
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Database className="mb-2 h-6 w-6 text-primary" />
                  <CardTitle>Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    PostgreSQL (Neon) + Drizzle ORM
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <SimpleIcon
                    icon={siBetterauth}
                    className="mb-2 h-6 w-6 text-primary"
                  />
                  <CardTitle>Auth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Better Auth with custom UI components
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              🚀 Quick Start
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Get up and running in minutes with our comprehensive setup guide
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <CardTitle className="text-lg">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left text-sm text-muted-foreground space-y-1">
                    <li>• Node.js 18+ or Bun</li>
                    <li>• PostgreSQL database (Neon)</li>
                    <li>• Cloudflare account</li>
                    <li>• Resend & Polar.sh accounts</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <CardTitle className="text-lg">Installation</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-left text-sm bg-muted p-2 rounded">
                    git clone &lt;your-repo-url&gt; cd
                    better-auth-cloudflare-starter bun install
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <CardTitle className="text-lg">Start Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-left text-sm bg-muted p-2 rounded">
                    bun run dev
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    🌐 Web App: http://localhost:3001
                    <br />
                    🚀 API Server: http://localhost:3000
                  </p>
                </CardContent>
              </Card>
            </div>
            <Separator className="my-12" />
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link to="/">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com/your-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SimpleIcon icon={siGithub} className="mr-2 h-4 w-4" />
                  View Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
