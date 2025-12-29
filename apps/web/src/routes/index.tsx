import { createFileRoute } from "@tanstack/react-router";
import { Hero, Pricing } from "@/components/landing";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Pricing />
    </div>
  );
}
