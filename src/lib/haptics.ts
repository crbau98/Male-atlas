"use client";

type VibratePattern = number | number[];

export function haptic(pattern: VibratePattern = 10) {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when vibration is blocked (e.g. no user gesture yet).
  }
}
