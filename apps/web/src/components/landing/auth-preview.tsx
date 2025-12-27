import { AuthView } from "@daveyplate/better-auth-ui";
import { FeatureList } from "./feature-list";

const features = [
  "Email & Password",
  "Social Logins (Google, GitHub)",
  "Session Management",
  "Zero config required",
];

export function AuthPreview() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Auth. <span className="text-muted-foreground">Solved.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Better Auth integration that feels native. Full type safety,
              social providers, and sessions handled for you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <FeatureList features={features} />
            <div className="w-full max-w-md mx-auto md:mx-0">
              <AuthView path="sign-in" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
