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

function signUpHandler({
	name,
	email,
	password,
	setError,
	setIsLoading,
	setName,
	setPassword,
	setFieldErrors,
}: {
	name: string;
	email: string;
	password: string;
	setError: (error: string | null) => void;
	setIsLoading: (loading: boolean) => void;
	setName: (name: string) => void;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
	setFieldErrors: (errors: {
		name?: string;
		email?: string;
		password?: string;
	}) => void;
}) {
	const errors: { name?: string; email?: string; password?: string } = {};

	if (!name.trim()) {
		errors.name = "Name is required";
	}

	if (!email.trim()) {
		errors.email = "Email is required";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
		errors.email = "Please enter a valid email address";
	}

	if (!password.trim()) {
		errors.password = "Password is required";
	} else if (password.length < 8) {
		errors.password = "Password must be at least 8 characters";
	}

	if (Object.keys(errors).length > 0) {
		setFieldErrors(errors);
		setIsLoading(false);
		return;
	}

	setIsLoading(true);
	setError(null);
	setFieldErrors({});

	authClient.signUp.email(
		{
			name: name.trim(),
			email: email.trim(),
			password,
		},
		{
			onError(error) {
				setError(error.error?.message || "Failed to sign up");
				setIsLoading(false);
			},
			onSuccess() {
				setName("");
				setPassword("");
				queryClient.invalidateQueries();
				// Redirect to verify OTP page with email
				router.push({
					pathname: "/verify-otp",
					params: { email: email.trim() },
				});
			},
			onFinished() {
				setIsLoading(false);
			},
		},
	);
}

export function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<{
		name?: string;
		email?: string;
		password?: string;
	}>({});

	const mutedColor = useThemeColor("muted");

	function handlePress() {
		signUpHandler({
			name,
			email,
			password,
			setError,
			setIsLoading,
			setName,
			setEmail,
			setPassword,
			setFieldErrors,
		});
	}

	return (
		<Surface variant="secondary" className="rounded-xl p-6">
			{error && <FieldError className="mb-4">{error}</FieldError>}

			<View className="gap-4">
				<TextField isInvalid={!!fieldErrors.name}>
					<Label>Name</Label>
					<Input
						value={name}
						onChangeText={(text) => {
							setName(text);
							if (fieldErrors.name) {
								setFieldErrors((prev) => ({ ...prev, name: undefined }));
							}
						}}
						placeholder="John Doe"
						autoCapitalize="words"
						autoComplete="name"
						editable={!isLoading}
					/>
					{fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
				</TextField>

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
							autoComplete="password-new"
							editable={!isLoading}
							className="flex-1 pr-10"
						/>
						<Pressable
							className="absolute right-3"
							onPress={() => setShowPassword(!showPassword)}
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
					onPress={handlePress}
					isDisabled={isLoading}
					className="mt-2"
					size="lg"
				>
					{isLoading ? (
						<View className="flex-row items-center gap-2">
							<Spinner size="sm" color="default" />
							<Button.Label>Creating account...</Button.Label>
						</View>
					) : (
						<Button.Label>Create Account</Button.Label>
					)}
				</Button>
			</View>
		</Surface>
	);
}
