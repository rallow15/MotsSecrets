import React, { useCallback } from 'react';
import { Animated, Pressable } from 'react-native';
import { useBouncePress } from '../animations';
import { triggerHaptic } from '../animations';
import { playClick } from '../sound';

/**
 * BouncePress - Pressable wrapper with bounce animation + haptic feedback
 *
 * Props:
 *   onPress      - function (required)
 *   style        - style object or array
 *   children     - React children
 *   disabled     - boolean
 *   haptic       - 'light' | 'medium' | 'heavy' (default: 'light')
 *   activeOpacity - number (0-1, default: 0.85) - simulated via opacity animation
 *   sound        - boolean (default: true) - whether to play click sound
 */
export default function BouncePress({ onPress, style, children, disabled, haptic = 'light', sound = true }) {
  const { onPressIn, onPressOut, animatedStyle } = useBouncePress();

  const handlePressIn = useCallback(() => {
    onPressIn();
    triggerHaptic(haptic);
  }, [onPressIn, haptic]);

  const handlePress = useCallback(() => {
    if (sound) playClick();
    onPress();
  }, [onPress, sound]);

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}