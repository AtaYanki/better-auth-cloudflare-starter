import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { queryClient } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import {
  Button,
  ErrorView,
  Spinner,
  Surface,
  TextField,
  useThemeColor,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const mutedColor = useThemeColor("muted");

  function validateFields() {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    await authClient.signIn.email(
      {
        email: email.trim(),
        password,
      },
      {
        onError(error) {
          const errorMessage = error.error?.message || "Failed to sign in";
          setError(errorMessage);
          setIsLoading(false);

          // Check if error is related to email verification
          const isEmailNotVerified =
            errorMessage.toLowerCase().includes("email") &&
            (errorMessage.toLowerCase().includes("verify") ||
              errorMessage.toLowerCase().includes("verification") ||
              errorMessage.toLowerCase().includes("not verified") ||
              errorMessage.toLowerCase().includes("unverified"));

          if (isEmailNotVerified && email.trim()) {
            // Redirect to verify OTP page
            setTimeout(() => {
              router.push({
                pathname: "/verify-otp",
                params: { email: email.trim() },
              });
            }, 1000);
          }
        },
        onSuccess() {
          setEmail("");
          setPassword("");
          queryClient.refetchQueries();
        },
        onFinished() {
          setIsLoading(false);
        },
      }
    );
  }

  return (
    <Surface variant="tertiary" className="p-6 rounded-xl">
      <ErrorView isInvalid={!!error} className="mb-4">
        {error}
      </ErrorView>

      <View className="gap-4">
        <TextField isInvalid={!!fieldErrors.email}>
          <TextField.Label>Email</TextField.Label>
          <TextField.Input
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />
          {fieldErrors.email && (
            <TextField.ErrorMessage>{fieldErrors.email}</TextField.ErrorMessage>
          )}
        </TextField>

        <TextField isInvalid={!!fieldErrors.password}>
          <TextField.Label>Password</TextField.Label>
          <TextField.Input
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            editable={!isLoading}
          >
            <TextField.InputEndContent>
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color={mutedColor}
                />
              </Pressable>
            </TextField.InputEndContent>
          </TextField.Input>
          {fieldErrors.password && (
            <TextField.ErrorMessage>
              {fieldErrors.password}
            </TextField.ErrorMessage>
          )}
        </TextField>

        <Button
          onPress={handleLogin}
          isDisabled={isLoading}
          className="mt-2"
          size="lg"
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <Spinner size="sm" color="default" />
              <Button.Label>Signing in...</Button.Label>
            </View>
          ) : (
            <Button.Label>Sign In</Button.Label>
          )}
        </Button>
      </View>
    </Surface>
  );
}

export { SignIn };
