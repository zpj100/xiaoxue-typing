const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export default function KeyGuide({ nextKey }: { nextKey: string }) {
  const expect = nextKey.toLowerCase()
  return (
    <div className="key-guide" aria-hidden="true">
      {ROWS.map((row) => (
        <div key={row} className="key-row">
          {row.split('').map((ch) => (
            <span key={ch} className={ch === expect ? 'key-cap key-next' : 'key-cap'}>
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
