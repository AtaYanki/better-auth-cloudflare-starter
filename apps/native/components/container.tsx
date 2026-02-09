import { cn } from "heroui-native";
import type { PropsWithChildren } from "react";
import { ScrollView, View, type ViewProps } from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = AnimatedProps<ViewProps> & {
	className?: string;
	topSafeArea?: boolean;
};

export function Container({
	children,
	className,
	topSafeArea = false,
	...props
}: PropsWithChildren<Props>) {
	const insets = useSafeAreaInsets();

	return (
		<AnimatedView
			className={"flex-1 bg-surface"}
			style={{
				paddingBottom: insets.bottom,
				paddingTop: topSafeArea ? insets.top : 0,
			}}
			{...props}
		>
			<ScrollView className={cn("flex-1", className)}>{children}</ScrollView>
		</AnimatedView>
	);
}
