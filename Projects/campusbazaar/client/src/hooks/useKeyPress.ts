import { useCallback, useEffect, useState } from "react";

/**
 * Tracks which key was last pressed. Useful for keyboard shortcuts.
 */
export function useKeyPress(targetKey: string): boolean {
  const [pressed, setPressed] = useState(false);

  const onDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === targetKey) setPressed(true);
    },
    [targetKey],
  );

  const onUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === targetKey) setPressed(false);
    },
    [targetKey],
  );

  useEffect(() => {
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [onDown, onUp]);

  return pressed;
}
