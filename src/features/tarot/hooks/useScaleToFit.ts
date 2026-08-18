import { useCallback, useEffect, useState } from "react";

/**
 * Skaluje scenę o stałej geometrii (bok `base`) do szerokości kontenera.
 * Dzięki temu układ kart jest identyczny na każdym urządzeniu — zmienia się
 * wyłącznie skala, nigdy proporcje.
 *
 * `measured` informuje, że skala została policzona — dopiero wtedy warto
 * uruchamiać animację rozkładania (bez skoku układu i migotania).
 */
export function useScaleToFit(base: number) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [measured, setMeasured] = useState(false);

  const ref = useCallback((element: HTMLDivElement | null) => setNode(element), []);

  useEffect(() => {
    if (!node) return;

    const measure = () => {
      const width = node.clientWidth;
      if (width > 0) {
        setScale(Math.min(1, width / base));
        setMeasured(true);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, base]);

  return { ref, scale, measured };
}
