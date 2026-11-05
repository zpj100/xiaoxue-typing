type Props = {
  onClick: () => void
  label?: string
}

export default function SpeakerButton({ onClick, label = '大声朗读' }: Props) {
  return (
    <button type="button" className="speaker-btn" onClick={onClick} aria-label={label} title={label}>
      <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 24h12l14-12v40L22 40H10V24zm40.2-9.2 4.2 4.2A19.9 19.9 0 0 1 60 32a19.9 19.9 0 0 1-5.6 13l-4.2-4.2A14 14 0 0 0 54 32a14 14 0 0 0-3.8-17.2zM44.6 20.4l4.2 4.2A9.9 9.9 0 0 1 52 32a9.9 9.9 0 0 1-3.2 7.4l-4.2-4.2A4 4 0 0 0 46 32a4 4 0 0 0-1.4-11.6z"
        />
      </svg>
      <span>朗读</span>
    </button>
  )
}
