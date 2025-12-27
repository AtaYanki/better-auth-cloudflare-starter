import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home, CreditCard } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/success")({
	component: SuccessPage,
	validateSearch: (search) => ({
		checkout_id: search.checkout_id as string,
	}),
});

function SuccessPage() {
	const { checkout_id } = useSearch({ from: "/success" });
	const { data: session } = authClient.useSession();

	return (
		<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-2xl">
				<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
					<CardHeader className="text-center pb-8">
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
							<CheckCircle2 className="h-12 w-12 text-primary" />
						</div>
						<CardTitle className="text-3xl font-bold md:text-4xl">
							Payment Successful!
						</CardTitle>
						<CardDescription className="mt-4 text-base md:text-lg">
							Thank you for your purchase. Your subscription is now active and you have full access to all features.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{checkout_id && (
							<div className="rounded-lg bg-muted/50 p-4">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<CreditCard className="h-4 w-4" />
									<span>Checkout ID:</span>
									<code className="rounded bg-background px-2 py-1 font-mono text-xs">
										{checkout_id}
									</code>
								</div>
							</div>
						)}
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							{session ? (
								<Button asChild className="text-lg px-8 py-6">
									<Link to="/dashboard">
										Go to Dashboard
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							) : (
								<Button asChild className="text-lg px-8 py-6">
									<Link to="/">
										<Home className="mr-2 h-5 w-5" />
										Go to Home
									</Link>
								</Button>
							)}
							<Button
								variant="outline"
							
								className="text-lg px-8 py-6 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80"
								asChild
							>
								<Link to="/">
									Back to Home
								</Link>
							</Button>
						</div>
						<div className="pt-4 text-center">
							<p className="text-sm text-muted-foreground">
								A confirmation email has been sent to your email address.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
