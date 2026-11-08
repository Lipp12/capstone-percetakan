import { Flower2, Sparkles } from 'lucide-react'
import { trustBadges } from '../../data/site'

export function AnnouncementBar() {
  const messages = [
    'Presisi warna CMYK terkalibrasi',
    'Proofing digital cepat 1×24 jam',
    'Bahan impor terkurasi untuk hasil terbaik',
    'Pengiriman aman seluruh Indonesia',
  ]

  const renderGroup = (hidden = false) => (
    <div className="flex shrink-0 items-center gap-6 px-3" aria-hidden={hidden || undefined}>
      {messages.map((message, index) => (
        <span
          key={message}
          className="flex items-center gap-2 whitespace-nowrap font-label-caps text-label-caps uppercase tracking-wider"
        >
          {index % 2 === 0 ? (
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          ) : (
            <Flower2 className="h-3.5 w-3.5 text-tertiary" aria-hidden="true" />
          )}
          {message}
          <span className="ml-4 text-on-secondary-container/40" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="w-full overflow-hidden bg-secondary-container py-2.5 text-on-secondary-container select-none">
      <div className="flex w-max animate-marquee">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
      <span className="sr-only">
        {trustBadges.map((badge) => `${badge.label}: ${badge.detail}`).join('. ')}
      </span>
    </div>
  )
}

export default AnnouncementBar
