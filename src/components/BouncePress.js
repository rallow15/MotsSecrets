import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, Easing } from 'react-native';
import { triggerHaptic } from '../animations';
import { playClick } from '../sound';

/**
 * BouncePress - Pressable wrapper with smooth spring animation + haptic feedback
 *
 * Props:
 *   onPress      - function (required)
 *   style        - style object or array
 *   children     - React children
 *   disabled     - boolean
 *   haptic       - 'light' | 'medium' | 'heavy' (default: 'light')
 *   sound        - boolean (default: true) - whether to play click sound
 */
export default function BouncePress({ onPress, style, children, disabled, haptic = 'light', sound = true }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 7,
      tension: 400,
      useNativeDriver: true,
    }).start();
    triggerHaptic(haptic);
  }, [scale, haptic]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    if (sound) playClick();
    onPress();
  }, [onPress, sound]);

  const animatedStyle = { transform: [{ scale }] };

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}