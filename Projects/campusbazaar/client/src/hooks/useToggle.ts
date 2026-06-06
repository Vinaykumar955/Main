import { useEffect, useState } from "react";

/**
 * Toggle a boolean. Stable toggle handler.
 */
export function useToggle(initial = false): [boolean, () => void, (next: boolean) => void] {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    /* empty */
  }, []);
  return [value, () => setValue((v) => !v), setValue];
}
