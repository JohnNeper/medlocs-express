// Decorative pseudo-QR
export function QRCode({ seed = "MEDLOCS-7H3K" }: { seed?: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 7) > 3);
  }
  const isFinder = (x: number, y: number) => {
    const inBox = (cx: number, cy: number) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
  };
  return (
    <div className="grid p-4 rounded-2xl bg-white border border-border shadow-card" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 220, height: 220, gap: 1 }}>
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const finder = isFinder(x, y);
        const filled = finder
          ? ((x === 0 || x === 6 || y === 0 || y === 6) ||
             (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
             (x >= size - 7 && (x === size - 7 || x === size - 1 || y === 0 || y === 6)) ||
             (y >= size - 7 && (y === size - 7 || y === size - 1 || x === 0 || x === 6)) ||
             (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4) ||
             (y >= size - 5 && y <= size - 3 && x >= 2 && x <= 4))
          : on;
        return <div key={i} className={filled ? "bg-foreground" : "bg-transparent"} />;
      })}
    </div>
  );
}
