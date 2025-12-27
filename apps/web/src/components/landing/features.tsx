import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  CreditCard,
  Database,
  Mail,
  Zap,
  Code,
  FileText,
  Users,
  Lock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Better Auth",
    description: "Authentication that just works. Social providers and email/password pre-configured. Secure session management included.",
  },
  {
    icon: CreditCard,
    title: "Polar.sh Integration",
    description: "Seamless payment system support. Use Polar for merchant of record benefits. Webhooks fully typed and handled.",
  },
  {
    icon: Mail,
    title: "Resend Email",
    description: "Transactional emails for auth, welcome, and notifications using React Email components. Beautiful templates included.",
  },
  {
    icon: Database,
    title: "Drizzle ORM",
    description: "Type-safe SQL with Drizzle. Schema migrations, seeding scripts, and optimized queries for PostgreSQL.",
  },
  {
    icon: Zap,
    title: "Cloudflare Workers",
    description: "Global edge runtime with Hono framework. Deploy to Cloudflare's edge network for low latency worldwide.",
  },
  {
    icon: Code,
    title: "Developer Experience",
    description: "TypeScript, TanStack Router, TailwindCSS, and hot reload. Built for productivity and type safety.",
  },
  {
    icon: FileText,
    title: "Type Safety",
    description: "End-to-end type safety from database to frontend. Shared types across the entire stack.",
  },
  {
    icon: Users,
    title: "Organization Support",
    description: "Built-in organization and team management. Multi-tenancy support out of the box.",
  },
  {
    icon: Lock,
    title: "Security First",
    description: "Secure by default with OTP, email verification, and session management. Follows security best practices.",
  },
  {
    icon: Globe,
    title: "Edge Deployed",
    description: "Deploy to Cloudflare Workers for global edge deployment. Low latency and high availability.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Feature Packed
            </h2>
            <p className="text-lg text-muted-foreground">
              Every technical requirement for a modern SaaS, solved and included.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <CardHeader>
                    <Icon className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

