import React from "react";
import { router } from "expo-router";
import { SignIn } from "@/components/sign-in";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function SignInPage() {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-background"
      style={{
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
            Welcome Back
          </Text>
          <Text className="text-muted-foreground text-center">
            Sign in to continue to your account
          </Text>
        </View>

        <SignIn />

        <View className="mt-6 flex-row justify-center items-center gap-2">
          <Text className="text-muted">Don't have an account?</Text>
          <Pressable onPress={() => router.push("/sign-up")}>
            <Text className="text-accent font-medium">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
