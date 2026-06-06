import { useEffect, useRef } from "react";

/**
 * Mount / unmount / dependency change side effects.
 */
export function useUpdateEffect(fn: () => void, deps: ReadonlyArray<unknown>) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      fn();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
