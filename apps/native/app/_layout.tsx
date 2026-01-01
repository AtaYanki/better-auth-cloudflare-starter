import "@/global.css";
import { Stack } from "expo-router";
import { queryClient } from "@/utils/trpc";
import { HeroUINativeProvider, useThemeColor } from "heroui-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function StackLayout() {
  const themeColorBackground = useThemeColor("background");
  const themeColorForeground = useThemeColor("foreground");
  const themeColorSurface = useThemeColor("surface");

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          title: "Modal",
          presentation: "modal",
          headerStyle: { backgroundColor: themeColorSurface },
          headerTintColor: themeColorForeground,
          contentStyle: { backgroundColor: themeColorSurface },
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AppThemeProvider>
            <HeroUINativeProvider config={{ toast: { contentWrapper } }}>
              <StackLayout />
            </HeroUINativeProvider>
          </AppThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
