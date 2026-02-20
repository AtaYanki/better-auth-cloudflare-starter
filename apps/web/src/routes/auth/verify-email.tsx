import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/verify-email")({
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	return (
		<main className="container mx-auto my-auto flex flex-col items-center p-4 md:p-6">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<MailCheck className="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Check your email</CardTitle>
					<CardDescription>
						We sent you a verification code. Please check your inbox and enter
						the code to verify your email address.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Button asChild variant="outline">
						<Link to="/auth/$path" params={{ path: "sign-in" }}>
							Back to Sign In
						</Link>
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
