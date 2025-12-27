import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

const plans = [
  {
    name: "Community",
    price: "$0",
    period: "Lifetime",
    description: "Perfect for learning the stack and building personal projects.",
    features: [
      "Better Auth Integration",
      "Basic Database Setup",
      "Cloudflare Workers",
      "TypeScript & TanStack Router",
      "TailwindCSS & shadcn/ui",
      "Email Templates",
      "Organization Support",
    ],
    cta: "Get Code",
    ctaLink: "https://github.com/atayanki/better-auth-cloudflare-starter",
    highlight: false,
  },
  {
    name: "Pro Bundle",
    originalPrice: "$299",
    price: "$199",
    period: "One-time",
    description: "The complete toolkit. Stop setting up, start shipping.",
    features: [
      "Everything in Community",
      "Full Documentation & Guides",
      "Stripe & Polar Integration",
      "Advanced Email Templates",
      "Priority Support",
      "Example Implementations",
      "Best Practices Guide",
    ],
    cta: "Start Building",
    ctaLink: "/auth/$path",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Simple Pricing.
            </h2>
            <p className="text-lg text-muted-foreground">
              Start for free, upgrade when you're ready to ship to production.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-border/50 bg-card/50 backdrop-blur-sm ${
                  plan.highlight
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-2 mt-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    {plan.ctaLink.startsWith("http") ? (
                      <a
                        href={plan.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link to={plan.ctaLink} params={{ path: "sign-up" }}>
                        {plan.cta}
                      </Link>
                    )}
                  </Button>
                  {plan.highlight && (
                    <p className="text-xs text-center text-muted-foreground">
                      Secure Payment via Stripe
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

