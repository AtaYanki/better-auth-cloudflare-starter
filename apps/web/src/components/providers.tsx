import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "./theme-provider";
import { Link, useRouter } from "@tanstack/react-router";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";

export function Providers({ children }: { children: React.ReactNode }) {
  const { navigate } = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthUIProviderTanstack
        emailOTP={true}
        authClient={authClient}
        emailVerification={true}
        social={{
          providers: ["google"],
        }}
        navigate={(href) => navigate({ href })}
        replace={(href) => navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}
      </AuthUIProviderTanstack>
    </ThemeProvider>
  );
}
