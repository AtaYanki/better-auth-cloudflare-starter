import { Redirect } from "expo-router";
import { Avatar, Button, Card, Chip, Spinner, Switch } from "heroui-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useCheckout, useSubscriptionStatus } from "@/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export default function Profile() {
	const { data: session } = authClient.useSession();
	const { toggleTheme, isDark } = useAppTheme();
	const { data: subscriptionStatus, isLoading: isSubLoading } =
		useSubscriptionStatus();
	const { checkout, isLoading: isCheckoutLoading } = useCheckout();

	if (!session) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	const user = session.user;
	const isEmailVerified = user.emailVerified;

	function handleSignOut() {
		authClient.signOut();
		queryClient.invalidateQueries();
	}

	return (
		<Container className="p-6">
			<ScrollView
				contentContainerClassName="gap-6"
				showsVerticalScrollIndicator={false}
			>
				{/* Profile Header */}
				<Card variant="secondary" className="p-6">
					<View className="items-center">
						<Avatar variant="soft" alt={user.name ?? undefined}>
							<Avatar.Image src={user.image ?? undefined} />
							<Avatar.Fallback>
								{user.name?.charAt(0).toUpperCase() || "U"}
							</Avatar.Fallback>
						</Avatar>
						<Text className="mb-1 font-bold text-2xl text-foreground">
							{user.name}
						</Text>
						<View className="flex-row items-center gap-2">
							<Text className="text-muted">{user.email}</Text>
							{isEmailVerified ? (
								<Chip variant="soft" color="success">
									<Chip.Label>Verified</Chip.Label>
								</Chip>
							) : (
								<Chip variant="soft" color="warning">
									<Chip.Label>Unverified</Chip.Label>
								</Chip>
							)}
						</View>
					</View>
				</Card>

				{/* Account Information */}
				<Card variant="secondary" className="p-6">
					<Card.Title className="mb-4">Account Information</Card.Title>
					<View className="gap-4">
						<View>
							<Text className="mb-1 text-foreground text-sm">Name</Text>
							<Text className="text-muted">{user.name}</Text>
						</View>
						<View>
							<Text className="mb-1 text-foreground text-sm">Email</Text>
							<Text className="text-muted">{user.email}</Text>
						</View>
						{user.createdAt && (
							<View>
								<Text className="mb-1 text-foreground text-sm">
									Member since
								</Text>
								<Text className="text-muted">
									{new Date(user.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</Text>
							</View>
						)}
					</View>
				</Card>

				{/* Subscription */}
				<Card variant="secondary" className="p-6">
					<Card.Title className="mb-4">Subscription</Card.Title>
					{isSubLoading ? (
						<View className="items-center py-4">
							<Spinner />
						</View>
					) : (
						<View className="gap-4">
							<View className="flex-row items-center justify-between">
								<Text className="text-foreground text-sm">Current Plan</Text>
								<Chip
									variant="soft"
									color={
										subscriptionStatus?.isProActive ? "success" : "default"
									}
								>
									<Chip.Label>
										{subscriptionStatus?.isProActive ? "Pro" : "Free"}
									</Chip.Label>
								</Chip>
							</View>

							{subscriptionStatus?.isProActive ? (
								<Text className="text-muted text-sm">
									You have access to all Pro features including unlimited todos.
								</Text>
							) : (
								<View className="gap-3">
									<Text className="text-muted text-sm">
										Upgrade to Pro for unlimited todos and advanced features.
									</Text>
									<Button
										onPress={() => checkout()}
										isDisabled={isCheckoutLoading}
										size="lg"
									>
										{isCheckoutLoading ? (
											<ActivityIndicator color="white" size="small" />
										) : (
											<Button.Label>Upgrade to Pro</Button.Label>
										)}
									</Button>
								</View>
							)}
						</View>
					)}
				</Card>

				{/* Settings */}
				<Card variant="secondary" className="p-6">
					<Card.Title className="mb-4">Settings</Card.Title>
					<View className="gap-4">
						<Pressable className="flex-row items-center justify-between py-2">
							<View className="flex-row items-center gap-3">
								<Text className="text-foreground">Dark Mode</Text>
							</View>
							<Switch isSelected={isDark} onPress={toggleTheme}>
								<Switch.Thumb />
							</Switch>
						</Pressable>
					</View>
				</Card>

				{/* Sign Out */}
				<Button
					variant="danger-soft"
					onPress={handleSignOut}
					className="mb-6"
					size="lg"
				>
					<Button.Label>Sign Out</Button.Label>
				</Button>
			</ScrollView>
		</Container>
	);
}
