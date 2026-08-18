import { motion, type Transition } from "motion/react";
import { CardBack } from "./CardBack";

const EASE = [0.22, 1, 0.36, 1] as const;

const LAYERS = [6, 5, 4, 3, 2, 1, 0];

/**
 * Zamknięta talia LIORA. W spoczynku leży równo, w trakcie tasowania wykonuje
 * spokojny, realistyczny ruch riffle przez ~2,5 s.
 */
export function DeckStack({
  shuffling,
  reduced,
  width,
  height,
}: {
  shuffling: boolean;
  reduced: boolean;
  width: number;
  height: number;
}) {
  return (
    <div className="relative" style={{ width, height }} aria-hidden>
      {LAYERS.map((depth) => {
        const side = depth % 2 === 0 ? -1 : 1;
        const rest = { x: depth * 1.2, y: -depth * 2.4, rotate: depth * 0.35, scale: 1 };

        const transition: Transition = shuffling
          ? {
              duration: 0.85,
              ease: EASE,
              delay: depth * 0.05,
              repeat: 2,
              repeatType: "loop",
            }
          : { duration: 1, ease: EASE };

        return (
          <motion.div
            key={depth}
            className="absolute inset-0 shadow-[0_30px_70px_-42px_oklch(0_0_0/95%)]"
            initial={rest}
            animate={
              reduced
                ? rest
                : shuffling
                  ? {
                      x: [rest.x, side * 30, side * 12, rest.x],
                      y: [rest.y, rest.y - 8, rest.y - 3, rest.y],
                      rotate: [rest.rotate, side * 5.5, side * 1.5, rest.rotate],
                      scale: [1, 1.015, 1.005, 1],
                    }
                  : rest
            }
            transition={transition}
          >
            <CardBack />
          </motion.div>
        );
      })}
    </div>
  );
}
