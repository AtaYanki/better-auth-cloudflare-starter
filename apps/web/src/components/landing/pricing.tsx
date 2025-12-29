import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { useCheckoutEmbed } from "@/hooks/use-polar";
import { POLAR_PRODUCTS } from "@/lib/polar-products";

export function Pricing() {
  const router = useRouter();
  const checkoutEmbed = useCheckoutEmbed();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description:
        "Perfect for getting started and building your next project.",
      cta: "Get Started",
      ctaAction: () => {
        return router.navigate({
          to: "/auth/$path",
          params: { path: "sign-up" },
        });
      },
      highlight: false,
    },
    {
      name: "Pro",
      price: "$10",
      period: "monthly",
      description:
        "Everything you need to ship faster with advanced features. Cancel anytime.",
      cta: "Upgrade to Pro",
      ctaAction: () =>
        checkoutEmbed.mutate({
          productId: POLAR_PRODUCTS.pro.id,
          slug: POLAR_PRODUCTS.pro.slug,
        }),
      highlight: true,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade to Pro for advanced features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-border/50 bg-card/50 backdrop-blur-sm ${
                  plan.highlight ? "border-primary shadow-lg scale-105" : ""
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    onClick={plan.ctaAction}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
