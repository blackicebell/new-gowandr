import React, { useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type PressableScaleProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({ children, containerStyle, style, onPress, disabled, ...props }: PressableScaleProps) {
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
    Haptics.selectionAsync().catch(() => undefined);
    onPress?.(event);
  };

  return (
    <Pressable disabled={disabled} onPress={handlePress} onPressIn={() => animateTo(0.97)} onPressOut={() => animateTo(1)} style={containerStyle} {...props}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
