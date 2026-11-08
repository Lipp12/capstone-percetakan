import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { cn } from '../../utils/cn'

export function ProductGallery({ images = [], name }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [broken, setBroken] = useState({})
  const activeImage = images[activeIndex]

  const go = (direction) => {
    setActiveIndex((index) => (index + direction + images.length) % images.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-high">
        {activeImage && !broken[activeImage] ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={`${name} — tampilan ${activeIndex + 1} dari ${images.length}`}
            className="h-full w-full object-cover"
            onError={() => setBroken((current) => ({ ...current, [activeImage]: true }))}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-outline">
            <ImageOff className="h-10 w-10" aria-hidden="true" />
            <span className="font-body-sm text-body-sm">Pratinjau gambar tidak tersedia</span>
          </div>
        )}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container-lowest/90 text-on-surface opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-surface-container-lowest focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container-lowest/90 text-on-surface opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-surface-container-lowest focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Gambar berikutnya"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-lg bg-ink/70 px-2 py-1 font-label-caps text-label-caps text-paper backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-2.5" role="group" aria-label={`Galeri ${name}`}>
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-xl border bg-surface-container-high transition-all',
                index === activeIndex
                  ? 'border-primary shadow-[0_0_0_2px_#6e5d15]'
                  : 'border-outline-variant/50 opacity-80 hover:opacity-100',
              )}
              aria-label={`Tampilkan gambar ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ProductGallery
