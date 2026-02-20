import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
	Button,
	FieldError,
	Input,
	Label,
	Spinner,
	Surface,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export function SignIn() {
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
			},
		);
	}

	return (
		<Surface variant="secondary" className="rounded-xl p-6">
			{error && <FieldError className="mb-4">{error}</FieldError>}

			<View className="gap-4">
				<TextField isInvalid={!!fieldErrors.email}>
					<Label>Email</Label>
					<Input
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
					{fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
				</TextField>

				<TextField isInvalid={!!fieldErrors.password}>
					<Label>Password</Label>
					<View className="w-full flex-row items-center">
						<Input
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
							className="flex-1 pr-10"
						/>
						<Pressable
							className="absolute right-3"
							onPress={() => setShowPassword(!showPassword)}
							accessibilityLabel={
								showPassword ? "Hide password" : "Show password"
							}
							accessibilityRole="button"
						>
							<Ionicons
								name={showPassword ? "eye-off-outline" : "eye-outline"}
								size={16}
								color={mutedColor}
							/>
						</Pressable>
					</View>
					{fieldErrors.password && (
						<FieldError>{fieldErrors.password}</FieldError>
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
