import { createFileRoute } from "@tanstack/react-router";
import { OrganizationView } from "@daveyplate/better-auth-ui";

export const Route = createFileRoute("/__authenticated/organization/$path")({
  component: RouteComponent,
});

function RouteComponent() {
  const { path } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <OrganizationView pathname={path} />
      </div>
    </div>
  );
}
