import { Check } from "lucide-react";
import { type ReactNode } from "react";

type FeatureItem = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

type FeatureListProps = {
  features: (string | FeatureItem)[];
};

export function FeatureList({ features }: FeatureListProps) {
  return (
    <div className="space-y-4">
      {features.map((feature, index) => {
        const isString = typeof feature === "string";
        const title = isString ? feature : feature.title;
        const description = isString ? undefined : feature.description;
        const icon = isString ? undefined : feature.icon;

        return (
          <div key={index} className="space-y-1.5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background">
                {icon || <Check className="h-3 w-3 text-primary" />}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

