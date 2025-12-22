import { AccountView } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__authenticated/account/$path")({
  component: RouteComponent,
});

function RouteComponent() {
  const { path } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <AccountView pathname={path} />
      </div>
    </div>
  );
}
