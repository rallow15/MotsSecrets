import { Animated, Vibration, Platform } from 'react-native';
import { useRef, useCallback, useEffect } from 'react';

// ─── Haptic Feedback ───
export function triggerHaptic(style = 'light') {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const ms = style === 'heavy' ? 50 : style === 'medium' ? 25 : 10;
      navigator.vibrate(ms);
    }
    return;
  }
  if (style === 'heavy') {
    Vibration.vibrate(50);
  } else if (style === 'medium') {
    Vibration.vibrate(25);
  } else {
    Vibration.vibrate(10);
  }
}

// ─── useBouncePress ───
// Returns animated scale style + onPressIn/onPressOut handlers for a bounce effect
export function useBouncePress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 7,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const animatedStyle = { transform: [{ scale }] };

  return { onPressIn, onPressOut, animatedStyle };
}

// ─── useFadeIn ───
// Returns opacity style + start() to trigger a fade-in animation
export function useFadeIn(duration = 300) {
  const opacity = useRef(new Animated.Value(0)).current;

  const start = useCallback(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  const animatedStyle = { opacity };

  return { animatedStyle, start };
}

// ─── useScaleIn ───
// Returns scale+opacity style + start() to trigger a scale-in entrance
export function useScaleIn() {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const start = useCallback(() => {
    scale.setValue(0.3);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const animatedStyle = { transform: [{ scale }], opacity };

  return { animatedStyle, start };
}

// ─── useModalAnimation ───
// Returns animated style + trigger() for a smooth modal entrance (scale + fade)
export function useModalAnimation(visible) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animatedStyle = { transform: [{ scale }], opacity };

  return animatedStyle;
}

// ─── useShimmer ───
// Returns translateX style + start()/stop() for a shimmer sweep effect
export function useShimmer() {
  const translateX = useRef(new Animated.Value(-300)).current;
  const loopRef = useRef(null);

  const start = useCallback(() => {
    translateX.setValue(-300);
    if (loopRef.current) { loopRef.current.stop(); }
    loopRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loopRef.current.start();
  }, [translateX]);

  const stop = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
    translateX.setValue(-300);
  }, [translateX]);

  const shimmerStyle = { transform: [{ translateX }] };

  return { shimmerStyle, start, stop };
}