import { Link } from 'react-router-dom'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { buttonStyles } from '../ui/Button'
import { formatNumber, formatRupiah } from '../../utils/format'

export function ProductCard({ product }) {
  return (
    <article className="group relative flex flex-col rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <Link
        to={`/produk/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-surface-container-high"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.images[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <Badge tone={product.badgeTone} className="absolute left-3 top-3 uppercase shadow-hard-sm">
            {product.badge}
          </Badge>
        ) : null}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-surface-container-lowest/90 px-2.5 py-1 font-label-caps text-label-caps text-tertiary shadow-sm backdrop-blur-sm">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {product.turnaround}
        </span>
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3 px-1.5 pb-1 pt-3.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">{product.category}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Min. {formatNumber(product.minOrder)} {product.unit}
            </span>
          </div>
          <h3 className="mt-1 font-headline-sm text-headline-sm text-on-surface transition-colors group-hover:text-primary">
            <Link to={`/produk/${product.slug}`} className="focus-visible:outline-none">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
            {product.shortDescription}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface-container px-2 py-0.5 font-label-caps text-label-caps text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-surface-container pt-3">
          <div className="min-w-0">
            <span className="block font-label-caps text-label-caps uppercase tracking-wider text-outline">Harga mulai</span>
            <p className="font-subheading text-subheading font-bold text-on-surface">
              {formatRupiah(product.priceFrom)}{' '}
              <span className="font-body-sm text-body-sm font-normal text-outline">{product.priceUnit}</span>
            </p>
          </div>
          <Link
            to={`/produk/${product.slug}`}
            className={buttonStyles({ variant: 'primary', size: 'sm', className: 'shrink-0' })}
            aria-label={`Lihat dan atur spesifikasi ${product.name}`}
          >
            Atur
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-3">
      <div className="skeleton aspect-[4/3] rounded-2xl" />
      <div className="space-y-3 px-1.5 pb-1 pt-4">
        <div className="flex justify-between gap-4">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="flex gap-1.5 pt-1">
          <div className="skeleton h-4 w-14" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-12" />
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-surface-container pt-3">
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-5 w-28" />
          </div>
          <div className="skeleton h-9 w-20 rounded-lg" />
        </div>
      </div>
    </article>
  )
}

export default ProductCard
