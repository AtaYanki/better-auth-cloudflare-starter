import { useRouter } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCheckoutEmbed } from "@/hooks/use-polar";

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
			ctaAction: () => checkoutEmbed.mutate({ slug: "pro" }),
			highlight: true,
		},
	];

	return (
		<section className="bg-background py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Choose Your Plan
						</h2>
						<p className="text-lg text-muted-foreground">
							Start free, upgrade to Pro for advanced features.
						</p>
					</div>
					<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
						{plans.map((plan) => (
							<Card
								key={plan.name}
								className={`relative border-border/50 bg-card/50 backdrop-blur-sm ${
									plan.highlight ? "scale-105 border-primary shadow-lg" : ""
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
									<div className="mt-2 flex items-baseline gap-2">
										<span className="font-bold text-4xl">{plan.price}</span>
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
