import { useTRPC } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "./theme-provider";
import { Link, useRouter } from "@tanstack/react-router";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const { navigate, invalidate } = useRouter();
  const uploadFile = useMutation(
    trpc.uploadFile.mutationOptions({
      onSuccess: () => {
        toast.success("File uploaded successfully");
      },
      onError: () => {
        toast.error("Failed to upload file");
      },
    })
  );
  const deleteFile = useMutation(
    trpc.deleteFile.mutationOptions({
      onSuccess: () => {
        toast.success("File deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete file");
      },
    })
  );

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
            if (session?.user.image) {
              await deleteFile.mutateAsync({
                key: session.user.image.split("/").pop()!,
              });
            }
            const formData = new FormData();
            formData.append("file", file);
            const data = await uploadFile.mutateAsync(formData);
            return data.url;
          },
          delete: async (url) => {
            await deleteFile.mutateAsync({ key: url.split("/").pop()! });
          },
          extension: "png",
          size: 128,
        }}
        deleteUser={true}
        organization={true}
        teams={true}
        emailOTP={true}
        authClient={authClient}
        emailVerification={{ otp: true }}
        social={{
          providers: ["google"],
        }}
        navigate={(href) => navigate({ href })}
        replace={(href) => navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
        onSessionChange={() => {
          invalidate();
        }}
      >
        {children}
      </AuthUIProviderTanstack>
    </ThemeProvider>
  );
}
