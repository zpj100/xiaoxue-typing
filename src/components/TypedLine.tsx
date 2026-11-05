type Props = {
  target: string
  typed: string
  hideTarget?: boolean
}

export default function TypedLine({ target, typed, hideTarget }: Props) {
  const chars = target.split('')
  return (
    <div className="typed-line" aria-live="polite">
      {chars.map((ch, i) => {
        if (i < typed.length) {
          const ok = typed[i] === ch
          return (
            <span key={`${ch}-${i}`} className={ok ? 'typed-ok' : 'typed-bad'}>
              {typed[i] === ' ' ? '·' : typed[i]}
            </span>
          )
        }
        if (hideTarget) {
          return (
            <span key={`${ch}-${i}`} className="typed-rest">
              {i === typed.length ? '_' : '·'}
            </span>
          )
        }
        return (
          <span key={`${ch}-${i}`} className="typed-rest">
            {ch === ' ' ? ' ' : ch}
          </span>
        )
      })}
    </div>
  )
}
