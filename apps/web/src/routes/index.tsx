import { createFileRoute } from "@tanstack/react-router";
import {
  Hero,
  BuiltWith,
  AuthPreview,
  PaymentPreview,
  EmailPreview,
  Features,
  CodeStructure,
  Pricing,
} from "@/components/landing";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen">
      <Hero />
      <BuiltWith />
      <AuthPreview />
      <PaymentPreview />
      <EmailPreview />
      <Features />
      <CodeStructure />
      <Pricing />
    </div>
  );
}
