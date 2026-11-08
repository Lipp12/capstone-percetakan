import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
      <Link to="/" className="flex items-center gap-1 rounded transition-colors hover:text-primary">
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Beranda</span>
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-outline-variant" aria-hidden="true" />
          {item.to ? (
            <Link to={item.to} className="rounded transition-colors hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-on-surface" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs
