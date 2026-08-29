// components/skeleton.tsx
import { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export const Skeleton = ({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB", // gray-200
          opacity,
        },
        style,
      ]}
    />
  );
};
