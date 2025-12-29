import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black dark:from-gray-950 dark:via-gray-900 dark:to-black" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] dark:block hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05),transparent_50%)] dark:hidden" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          {/* Main Title */}
          <h1 className="mb-6 text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl">
            <span className="text-foreground">Better Auth</span>
            <br />
            <span className="text-muted-foreground">Cloudflare Starter</span>
          </h1>

          {/* Description */}
          <p className="mb-10 text-xl text-muted-foreground md:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed">
            A production-ready full-stack starter template built on Cloudflare
            Workers with enterprise-grade authentication, payments, and modern
            development practices. For serious builders.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-8">
            <Button asChild size="lg" className="text-lg px-8 py-6 group">
              <Link to="/auth/$path" params={{ path: "sign-up" }}>
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
