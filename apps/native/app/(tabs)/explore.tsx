import { Ionicons } from "@expo/vector-icons";
import { Card, Surface, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { Container } from "@/components/container";

type Feature = {
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
};

export default function Explore() {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	const features: Feature[] = [
		{
			title: "Authentication",
			description: "Sign in and sign up functionality",
			icon: "lock-closed-outline",
		},
		{
			title: "Theme System",
			description: "Dark and light mode support",
			icon: "color-palette-outline",
		},
		{
			title: "API Integration",
			description: "tRPC queries and mutations",
			icon: "cloud-outline",
		},
	];

	return (
		<Container className="p-6">
			<View className="mb-6">
				<Text className="mb-2 font-bold text-3xl text-foreground">Explore</Text>
				<Text className="text-muted">Discover features and components</Text>
			</View>

			<View className="gap-4">
				{features.map((feature, index) => (
					<Card key={index.toString()} variant="secondary" className="p-4">
						<View className="flex-row items-center">
							<View
								className="mr-4 h-12 w-12 items-center justify-center rounded-lg"
								style={{ backgroundColor: `${mutedColor}20` }}
							>
								<Ionicons
									name={feature.icon}
									size={24}
									color={foregroundColor}
								/>
							</View>
							<View className="flex-1">
								<Text className="mb-1 font-semibold text-base text-foreground">
									{feature.title}
								</Text>
								<Card.Description>{feature.description}</Card.Description>
							</View>
						</View>
					</Card>
				))}
			</View>

			<Surface variant="tertiary" className="mt-6 rounded-lg p-4">
				<Text className="mb-2 font-medium text-foreground">Quick Start</Text>
				<Text className="text-muted text-sm">
					This boilerplate includes authentication, theming, and API integration
					ready to use.
				</Text>
			</Surface>
		</Container>
	);
}
