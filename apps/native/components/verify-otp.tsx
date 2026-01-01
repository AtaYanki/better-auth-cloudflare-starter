import { Button, ErrorView, Spinner, Surface, TextField } from "heroui-native";
import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";
import { router, useLocalSearchParams } from "expo-router";

export function VerifyOTP() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function handleVerify() {
    if (!otp.trim() || otp.length !== 6) {
      setFieldError("Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldError(undefined);

    try {
      await authClient.emailOtp.verifyEmail({
        email,
        otp: otp.trim(),
      });

      setSuccess(true);
      queryClient.refetchQueries();
      
      // Redirect to tabs after a short delay
      setTimeout(() => {
        router.replace("/sign-in");
      }, 1500);
    } catch (err: any) {
      setError(err?.error?.message || "Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      setCountdown(60); // 60 second countdown
      setIsResending(false);
    } catch (err: any) {
      setError(err?.error?.message || "Failed to resend code. Please try again.");
      setIsResending(false);
    }
  }

  if (success) {
    return (
      <Surface variant="tertiary" className="p-6 rounded-xl">
        <View className="items-center gap-4">
          <Text className="text-2xl font-bold text-foreground">Email Verified!</Text>
          <Text className="text-muted-foreground text-center">
            Your email has been successfully verified. Redirecting...
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface variant="tertiary" className="p-6 rounded-xl">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">
          Verify Your Email
        </Text>
        <Text className="text-muted-foreground text-sm">
          We've sent a 6-digit verification code to
        </Text>
        <Text className="text-foreground font-medium mt-1">{email}</Text>
      </View>

      <ErrorView isInvalid={!!error} className="mb-4">
        {error}
      </ErrorView>

      <View className="gap-4">
        <TextField isInvalid={!!fieldError}>
          <TextField.Label>Verification Code</TextField.Label>
          <TextField.Input
            value={otp}
            onChangeText={(text) => {
              // Only allow numbers and limit to 6 digits
              const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
              setOtp(numericText);
              setError(null);
              if (fieldError) {
                setFieldError(undefined);
              }
            }}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
            autoFocus
          />
          {fieldError && (
            <TextField.ErrorMessage>{fieldError}</TextField.ErrorMessage>
          )}
        </TextField>

        <Button
          onPress={handleVerify}
          isDisabled={isLoading || otp.length !== 6}
          className="mt-2"
          size="lg"
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <Spinner size="sm" color="default" />
              <Button.Label>Verifying...</Button.Label>
            </View>
          ) : (
            <Button.Label>Verify Email</Button.Label>
          )}
        </Button>

        <View className="flex-row items-center justify-center gap-2 mt-2">
          <Text className="text-muted-foreground text-sm">
            Didn't receive the code?
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleResend}
            isDisabled={isResending || countdown > 0}
          >
            {isResending ? (
              <Spinner size="sm" color="default" />
            ) : countdown > 0 ? (
              <Button.Label>Resend in {countdown}s</Button.Label>
            ) : (
              <Button.Label>Resend Code</Button.Label>
            )}
          </Button>
        </View>
      </View>
    </Surface>
  );
}

