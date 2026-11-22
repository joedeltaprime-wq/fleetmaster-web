export function Sparkline({ values, color, width = 120, height = 24 }: { values: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(1, ...values)
  const bw = width / Math.max(1, values.length)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block">
      {values.map((v, i) => {
        const h = v > 0 ? Math.max(2, (v / max) * height) : 1
        return (
          <rect
            key={i}
            x={i * bw + 1}
            y={height - h}
            width={Math.max(1, bw - 2)}
            height={h}
            rx={1}
            fill={v > 0 ? color : 'var(--border)'}
            opacity={v > 0 ? 0.85 : 1}
          />
        )
      })}
    </svg>
  )
}
