// Deterministic blockie-style identicon generated from a string (a PDA).
// 5×5 horizontally-mirrored grid, hue derived from a hash. No dependencies.

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Identicon({
  value,
  size = 48,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const rng = mulberry32(hashSeed(value));
  const hue = Math.floor(rng() * 360);
  const color = `hsl(${hue} 64% 56%)`;
  const bg = `hsl(${hue} 26% 14%)`;

  const grid = 5;
  const half = Math.ceil(grid / 2);
  const rows: boolean[][] = [];
  for (let y = 0; y < grid; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < half; x++) row.push(rng() > 0.5);
    for (let x = Math.floor(grid / 2) - 1; x >= 0; x--) row.push(row[x]);
    rows.push(row);
  }

  const cell = size / grid;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ borderRadius: size * 0.26 }}
      aria-hidden
    >
      <rect width={size} height={size} fill={bg} />
      {rows.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={color} />
          ) : null,
        ),
      )}
    </svg>
  );
}
