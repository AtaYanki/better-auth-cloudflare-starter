import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { Card, Surface, useThemeColor } from "heroui-native";

export default function Explore() {
  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");

  const features = [
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
        <Text className="text-3xl font-bold text-foreground mb-2">Explore</Text>
        <Text className="text-muted">Discover features and components</Text>
      </View>

      <View className="gap-4">
        {features.map((feature, index) => (
          <Card key={index} variant="secondary" className="p-4">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                style={{ backgroundColor: `${mutedColor}20` }}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={foregroundColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base mb-1">
                  {feature.title}
                </Text>
                <Card.Description>{feature.description}</Card.Description>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Surface variant="tertiary" className="p-4 rounded-lg mt-6">
        <Text className="text-foreground font-medium mb-2">Quick Start</Text>
        <Text className="text-muted text-sm">
          This boilerplate includes authentication, theming, and API integration
          ready to use.
        </Text>
      </Surface>
    </Container>
  );
}
