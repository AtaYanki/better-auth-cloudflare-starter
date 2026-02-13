import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { HeroUINativeProvider, useThemeColor } from "heroui-native";
import { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	KeyboardAvoidingView,
	KeyboardProvider,
} from "react-native-keyboard-controller";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { queryClient } from "@/utils/trpc";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

function StackLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorSurface = useThemeColor("surface");

	return (
		<Stack>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="modal"
				options={{
					title: "Modal",
					presentation: "modal",
					headerStyle: { backgroundColor: themeColorSurface },
					headerTintColor: themeColorForeground,
					contentStyle: { backgroundColor: themeColorSurface },
				}}
			/>
		</Stack>
	);
}

export default function Layout() {
	const url = Linking.useURL();

	useEffect(() => {
		if (url) {
			const parsed = Linking.parse(url);
			if (
				parsed.hostname === "checkout-success" ||
				parsed.path === "checkout-success"
			) {
				queryClient.invalidateQueries();
			}
		}
	}, [url]);

	const contentWrapper = useCallback(
		(children: React.ReactNode) => (
			<KeyboardAvoidingView
				pointerEvents="box-none"
				behavior="padding"
				keyboardVerticalOffset={12}
				className="flex-1"
			>
				{children}
			</KeyboardAvoidingView>
		),
		[],
	);

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider
							config={{
								toast: { contentWrapper },
								// devInfo: { stylingPrinciples: false },
							}}
						>
							<StackLayout />
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
