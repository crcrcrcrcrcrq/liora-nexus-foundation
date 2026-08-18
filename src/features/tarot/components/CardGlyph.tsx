/**
 * Ilustracje awersów autorskiej talii LIORA — minimalistyczna grafika liniowa,
 * jedna kompozycja na każdy z 22 Wielkich Arkanów. Wyłącznie prezentacja.
 */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ray(index: number, count: number, inner: number, outer: number) {
  const angle = (index / count) * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return `M ${50 + cos * inner} ${50 + sin * inner} L ${50 + cos * outer} ${50 + sin * outer}`;
}

const GLYPHS: Record<number, React.ReactNode> = {
  // 0 Głupiec — krawędź i krok
  0: (
    <>
      <path d="M14 74 L52 74 L64 60" />
      <circle cx="72" cy="34" r="9" />
      <path d="M72 43 L72 66 M62 52 L82 52 M72 66 L64 80 M72 66 L80 80" />
    </>
  ),
  // I Mag — narzędzia i oś
  1: (
    <>
      <path d="M50 16 L50 84" />
      <circle cx="50" cy="50" r="20" />
      <path d="M30 30 L70 70 M70 30 L30 70" />
    </>
  ),
  // II Kapłanka — brama i księżyc
  2: (
    <>
      <path d="M32 84 L32 44 A18 18 0 0 1 68 44 L68 84" />
      <path d="M50 84 L50 26" />
      <path d="M42 34 A10 10 0 1 0 42 54 A13 13 0 0 1 42 34" />
    </>
  ),
  // III Cesarzowa — pełnia, owoc
  3: (
    <>
      <circle cx="50" cy="52" r="24" />
      <path d="M50 28 C36 40 36 64 50 76 C64 64 64 40 50 28" />
      <path d="M50 28 L50 14 M50 18 L60 12" />
    </>
  ),
  // IV Cesarz — tron, struktura
  4: (
    <>
      <path d="M28 84 L28 34 L50 20 L72 34 L72 84" />
      <path d="M28 56 L72 56 M40 84 L40 56 M60 84 L60 56" />
    </>
  ),
  // V Kapłan — trzy stopnie
  5: (
    <>
      <path d="M20 82 L80 82 M28 68 L72 68 M36 54 L64 54" />
      <path d="M50 54 L50 18 M38 30 L62 30" />
    </>
  ),
  // VI Kochankowie — dwa łuki
  6: (
    <>
      <path d="M40 78 A18 18 0 1 1 40 34" />
      <path d="M60 34 A18 18 0 1 1 60 78" />
      <path d="M50 20 L50 88" />
    </>
  ),
  // VII Rydwan — ruch
  7: (
    <>
      <path d="M26 62 L74 62 L68 40 L32 40 Z" />
      <circle cx="36" cy="74" r="9" />
      <circle cx="64" cy="74" r="9" />
      <path d="M50 40 L50 22" />
    </>
  ),
  // VIII Siła — nieskończoność
  8: (
    <>
      <path d="M50 50 C40 32 20 34 20 50 C20 66 40 68 50 50 C60 32 80 34 80 50 C80 66 60 68 50 50 Z" />
      <path d="M50 66 L50 84 M38 84 L62 84" />
    </>
  ),
  // IX Pustelnik — latarnia
  9: (
    <>
      <path d="M38 26 L62 26 L58 44 L42 44 Z" />
      <path d="M50 44 L50 84" />
      <circle cx="50" cy="35" r="5" />
      <path d="M30 84 L70 84" />
    </>
  ),
  // X Koło Fortuny
  10: (
    <>
      <circle cx="50" cy="50" r="28" />
      <circle cx="50" cy="50" r="11" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={ray(i, 8, 11, 28)} />
      ))}
    </>
  ),
  // XI Sprawiedliwość — waga
  11: (
    <>
      <path d="M50 18 L50 84 M26 32 L74 32" />
      <path d="M26 32 L16 54 A11 11 0 0 0 36 54 Z" />
      <path d="M74 32 L64 54 A11 11 0 0 0 84 54 Z" />
      <path d="M34 84 L66 84" />
    </>
  ),
  // XII Wisielec — odwrócenie
  12: (
    <>
      <path d="M22 20 L78 20 M50 20 L50 40" />
      <circle cx="50" cy="50" r="10" />
      <path d="M50 60 L50 74 L36 86 M50 74 L64 86" />
    </>
  ),
  // XIII Śmierć — próg
  13: (
    <>
      <path d="M30 84 L30 44 A20 20 0 0 1 70 44 L70 84 Z" />
      <path d="M30 64 L70 64" />
      <path d="M50 44 L50 64" />
    </>
  ),
  // XIV Umiarkowanie — dwa naczynia
  14: (
    <>
      <path d="M26 30 L46 30 L42 48 L30 48 Z" />
      <path d="M56 56 L76 56 L72 74 L60 74 Z" />
      <path d="M42 48 C52 54 56 50 60 56" />
      <path d="M22 82 L82 82" />
    </>
  ),
  // XV Diabeł — łańcuch
  15: (
    <>
      <path d="M50 18 L50 34" />
      <path d="M32 44 L68 44" />
      <path d="M36 44 L28 82 M64 44 L72 82" />
      <circle cx="36" cy="62" r="6" />
      <circle cx="64" cy="62" r="6" />
    </>
  ),
  // XVI Wieża — pęknięcie
  16: (
    <>
      <path d="M34 84 L34 34 L50 20 L66 34 L66 84" />
      <path d="M34 52 L66 52" />
      <path d="M50 20 L44 52 L56 66 L50 84" />
    </>
  ),
  // XVII Gwiazda
  17: (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={ray(i, 8, 0, i % 2 === 0 ? 32 : 18)} />
      ))}
      <circle cx="50" cy="50" r="6" />
    </>
  ),
  // XVIII Księżyc
  18: (
    <>
      <path d="M60 22 A28 28 0 1 0 60 78 A34 34 0 0 1 60 22" />
      <path d="M76 30 L80 34 M78 56 L84 58 M70 70 L74 76" />
    </>
  ),
  // XIX Słońce
  19: (
    <>
      <circle cx="50" cy="50" r="17" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <path key={i} d={ray(i, 12, 23, 32)} />
      ))}
    </>
  ),
  // XX Sąd — wezwanie
  20: (
    <>
      <path d="M22 46 L58 30 L58 62 Z" />
      <path d="M58 38 L80 38 M58 46 L84 46 M58 54 L80 54" />
      <path d="M26 74 L74 74" />
    </>
  ),
  // XXI Świat — wieniec
  21: (
    <>
      <ellipse cx="50" cy="50" rx="22" ry="32" />
      <circle cx="50" cy="50" r="14" />
      <path d="M50 18 L50 10 M50 82 L50 90 M28 50 L18 50 M72 50 L82 50" />
    </>
  ),
};

export function CardGlyph({ id, className }: { id: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <g {...STROKE}>{GLYPHS[id] ?? GLYPHS[0]}</g>
    </svg>
  );
}
