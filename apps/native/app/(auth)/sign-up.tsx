import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignUp } from "@/components/sign-up";

export default function SignUpPage() {
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
						Create Account
					</Text>
					<Text className="text-center text-muted-foreground">
						Sign up to get started with your account
					</Text>
				</View>

				<SignUp />

				<View className="mt-6 flex-row items-center justify-center gap-2">
					<Text className="text-muted">Already have an account?</Text>
					<Pressable onPress={() => router.push("/sign-in")}>
						<Text className="font-medium text-accent">Sign In</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
