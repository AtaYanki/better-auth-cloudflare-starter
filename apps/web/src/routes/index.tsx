import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  siBetterauth,
  siCloudflareworkers,
  siGithub,
  siResend,
} from "simple-icons";
import { useTRPC } from "@/utils/trpc";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import SimpleIcon from "@/components/simple-icon";
import { createFileRoute } from "@tanstack/react-router";
import { Code, CreditCard, Zap, ArrowRight, Database } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const trpc = useTRPC();
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Production-Ready Starter
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            Better Auth
            <br />
            <span className="text-primary">Cloudflare Starter</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            A production-ready full-stack starter template built on Cloudflare
            Workers with enterprise-grade authentication, payments, and modern
            development practices.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth/$path" params={{ path: "sign-up" }}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground">
                Built with modern technologies for scale and developer
                experience
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <SimpleIcon
                    icon={siBetterauth}
                    className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform"
                  />
                  <CardTitle>Secure Authentication</CardTitle>
                  <CardDescription>
                    Better Auth with OTP, email verification, and secure
                    sessions
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CreditCard className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Payment Processing</CardTitle>
                  <CardDescription>
                    Polar.sh integration with subscription management
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Database className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Modern Database</CardTitle>
                  <CardDescription>
                    PostgreSQL with Drizzle ORM and Neon hosting
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <SimpleIcon
                    icon={siResend}
                    className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform"
                  />
                  <CardTitle>Email Integration</CardTitle>
                  <CardDescription>
                    Transactional emails with Resend and custom templates
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <SimpleIcon
                    icon={siCloudflareworkers}
                    className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform"
                  />
                  <CardTitle>Cloudflare Workers</CardTitle>
                  <CardDescription>
                    Global edge runtime with Hono framework
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Code className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Developer Experience</CardTitle>
                  <CardDescription>
                    TypeScript, TanStack, TailwindCSS, and hot reload
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Build Something Amazing?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of developers building with Better Auth and
              Cloudflare
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link to="/auth/$path" params={{ path: "sign-up" }}>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Building Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com/your-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SimpleIcon icon={siGithub} className="mr-2 h-4 w-4" />
                  View Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API Status Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <section className="rounded-lg border p-6 bg-background">
              <h2 className="mb-4 font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                API Status
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    healthCheck.isLoading
                      ? "bg-yellow-500 animate-pulse"
                      : healthCheck.data
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-muted-foreground">
                  {healthCheck.isLoading
                    ? "Checking connection..."
                    : healthCheck.data
                    ? "All systems operational"
                    : "Service temporarily unavailable"}
                </span>
              </div>
              {healthCheck.data && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your Better Auth Cloudflare Starter is running smoothly! 🚀
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
