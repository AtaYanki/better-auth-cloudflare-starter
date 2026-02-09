import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VerifyOTP } from "@/components/verify-otp";
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
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Verify Your Email
					</Text>
					<Text className="text-center text-muted-foreground">
						Enter the code sent to your email address
					</Text>
				</View>

				<VerifyOTP />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
