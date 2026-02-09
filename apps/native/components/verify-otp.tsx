import { router, useLocalSearchParams } from "expo-router";
import {
	Button,
	FieldError,
	InputOTP,
	Label,
	Spinner,
	Surface,
	TextField,
} from "heroui-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

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
		if (!otp || otp.length !== 6) {
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
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Invalid verification code. Please try again.",
			);
			setIsLoading(false);
		}
	}

	async function handleComplete(code: string) {
		setOtp(code);
		// Auto-submit when all 6 digits are entered
		if (code.length === 6 && email) {
			await handleVerify();
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
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to resend code. Please try again.",
			);
			setIsResending(false);
		}
	}

	if (success) {
		return (
			<Surface variant="secondary" className="rounded-xl p-6">
				<View className="items-center gap-4">
					<Text className="font-bold text-2xl text-foreground">
						Email Verified!
					</Text>
					<Text className="text-center text-muted-foreground">
						Your email has been successfully verified. Redirecting...
					</Text>
				</View>
			</Surface>
		);
	}

	return (
		<Surface variant="secondary" className="rounded-xl p-6">
			<View className="mb-4">
				<Text className="mb-2 font-semibold text-foreground text-lg">
					Verify Your Email
				</Text>
				<Text className="text-muted-foreground text-sm">
					We've sent a 6-digit verification code to
				</Text>
				<Text className="mt-1 font-medium text-foreground">{email}</Text>
			</View>

			{error && <FieldError className="mb-4">{error}</FieldError>}

			<View className="gap-4">
				<TextField isInvalid={!!fieldError}>
					<Label>Verification Code</Label>
					<InputOTP
						value={otp}
						onChange={(value) => {
							setOtp(value);
							setError(null);
							if (fieldError) {
								setFieldError(undefined);
							}
						}}
						onComplete={handleComplete}
						maxLength={6}
						isDisabled={isLoading}
						isInvalid={!!fieldError}
						inputMode="numeric"
					>
						<InputOTP.Group>
							<InputOTP.Slot index={0} />
							<InputOTP.Slot index={1} />
							<InputOTP.Slot index={2} />
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group>
							<InputOTP.Slot index={3} />
							<InputOTP.Slot index={4} />
							<InputOTP.Slot index={5} />
						</InputOTP.Group>
					</InputOTP>
					{fieldError && <FieldError>{fieldError}</FieldError>}
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

				<View className="mt-2 flex-row items-center justify-center gap-2">
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
