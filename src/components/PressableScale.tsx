import React, { useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type PressableScaleProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({ children, style, onPress, disabled, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.(event);
  };

  return (
    <Pressable disabled={disabled} onPress={handlePress} onPressIn={() => animateTo(0.97)} onPressOut={() => animateTo(1)} {...props}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
