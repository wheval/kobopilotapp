export function hapticTap() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
  }
}

export function hapticSuccess() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([15, 40, 15]);
  }
}

export function hapticError() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([30, 20, 30]);
  }
}

export function hapticPress() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(5);
  }
}
