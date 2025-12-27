import SimpleIcon from "@/components/simple-icon";
import {
  siBetterauth,
  siCloudflareworkers,
  siResend,
  siTanstack,
  siDrizzle,
  siTailwindcss,
  siTypescript,
  siGithub,
  siHono,
} from "simple-icons";
import { Card, CardContent } from "@/components/ui/card";

const techStack = [
  { icon: siTanstack, name: "TanStack Start", description: "Full-stack framework" },
  { icon: siBetterauth, name: "Better Auth", description: "Modern authentication" },
  { icon: siGithub, name: "Better Auth UI", description: "Auth components" },
  { icon: siCloudflareworkers, name: "Cloudflare Workers", description: "Edge runtime" },
  { icon: siResend, name: "Resend", description: "Email for developers" },
  { icon: siDrizzle, name: "Drizzle", description: "TypeScript ORM" },
  { icon: siHono, name: "Hono", description: "Web framework" },
  { icon: siTailwindcss, name: "Tailwind CSS", description: "Utility-first CSS" },
  { icon: siGithub, name: "shadcn/ui", description: "Accessible components" },
  { icon: siTypescript, name: "TypeScript", description: "Type safety" },
];

export function BuiltWith() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Built With
            </h2>
            <p className="text-lg text-muted-foreground">
              The Best Tools in the Ecosystem
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {techStack.map((tech, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all hover:scale-105 border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <SimpleIcon
                    icon={tech.icon}
                    className="mb-3 h-10 w-10 text-foreground group-hover:scale-110 transition-transform"
                  />
                  <h3 className="mb-1 text-sm font-semibold">{tech.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {tech.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

