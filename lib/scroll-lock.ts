/**
 * Stop the page from scrolling while an overlay is open. Returns an unlock fn.
 *
 * Locks <html>, not <body>: `overflow: hidden` on body turns it into its own
 * scroll container, which breaks the desktop sidebar's `position: sticky`
 * (it jumps up by the current scroll offset) and, because <html> already sets
 * overflow-x, doesn't even stop the viewport from scrolling.
 *
 * Reference-counted so overlapping overlays (e.g. tour + chat) don't unlock
 * each other early.
 */
let locks = 0;
let previous = "";

export function lockPageScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) {
    previous = root.style.overflow;
    root.style.overflow = "hidden";
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) root.style.overflow = previous;
  };
}
