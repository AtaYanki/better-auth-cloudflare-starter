import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignIn } from "@/components/sign-in";

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
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Welcome Back
					</Text>
					<Text className="text-center text-muted-foreground">
						Sign in to continue to your account
					</Text>
				</View>

				<SignIn />

				<View className="mt-6 flex-row items-center justify-center gap-2">
					<Text className="text-muted">Don't have an account?</Text>
					<Pressable onPress={() => router.push("/sign-up")}>
						<Text className="font-medium text-accent">Sign Up</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
