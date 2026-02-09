import { AcceptInvitationCard } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accept-invitation")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto flex items-start justify-center px-4 py-6">
				<AcceptInvitationCard />
			</div>
		</div>
	);
}
