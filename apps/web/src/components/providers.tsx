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
        avatar={{
          upload: async (file) => {
            const formData = new FormData()
            formData.append("avatar", file)
            const res = await fetch("/api/uploadAvatar", { method: "POST", body: formData })
            const { data } = await res.json()
            return data.url
          },
          delete: async (url) => {
            await fetch("/api/deleteAvatar", { method: "POST", body: JSON.stringify({ url }) })
          },
          extension: "png",
          size: 128,
        }}
        emailOTP={true}
        authClient={authClient}
        emailVerification={{ otp: true }}
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
