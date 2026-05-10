type SpacerProps = {
  horizontal?: number,
  vertical?: number
}

export function SpacerComp({ horizontal = 0, vertical = 20 }: SpacerProps) {
  // Na web é mais comum usar margin, mas padding funciona também.
  return (
    <div style={{ padding: `${vertical}px ${horizontal}px` }}></div>
  )
}