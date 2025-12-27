import { createFileRoute } from "@tanstack/react-router";
import { AcceptInvitationCard } from "@daveyplate/better-auth-ui";

export const Route = createFileRoute("/accept-invitation")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 flex items-start justify-center">
        <AcceptInvitationCard />
      </div>
    </div>
  );
}
