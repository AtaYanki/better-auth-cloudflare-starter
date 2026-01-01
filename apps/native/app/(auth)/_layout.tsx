import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { Button, useThemeColor } from "heroui-native";
import { Redirect, router, Stack } from "expo-router";

export default function AuthLayout() {
  const { data: session } = authClient.useSession();
  const themeColorBackground = useThemeColor("background");
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBorder = useThemeColor("border");

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        headerLeft: () => (
          <Button
            onPress={() => router.replace("/")}
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={useThemeColor("accent")}
            />
          </Button>
        ),
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
        }}
      />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
      <Stack.Screen
        name="verify-otp"
        options={{
          title: "Verify Email",
        }}
      />
    </Stack>
  );
}
