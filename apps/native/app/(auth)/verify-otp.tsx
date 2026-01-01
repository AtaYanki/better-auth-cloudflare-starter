import React, { useEffect } from "react";
import { VerifyOTP } from "@/components/verify-otp";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useLocalSearchParams, router } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function VerifyOTPPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const { data: session } = authClient.useSession();

  // Redirect to sign-in if no email provided
  useEffect(() => {
    if (!params.email) {
      router.replace("/(auth)/sign-in");
      return;
    }

    // If user is already verified and has a session, redirect to tabs
    if (session?.user?.emailVerified) {
      router.replace("/(tabs)");
    }
  }, [params.email, session]);

  if (!params.email) {
    return null;
  }

  // If user is already verified, show a message briefly before redirect
  if (session?.user?.emailVerified) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Verify Your Email
          </Text>
          <Text className="text-muted-foreground text-center">
            Enter the code sent to your email address
          </Text>
        </View>

        <VerifyOTP />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
