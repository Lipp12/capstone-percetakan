import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export function Logo({ compact = false, className }) {
  return (
    <Link
      to="/"
      className={cn('group flex items-center gap-2.5 rounded-xl no-tap-highlight', className)}
      aria-label="Faeyza Digital Printing Studio — kembali ke katalog"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-on-surface bg-primary-container text-on-primary-container shadow-hard-sm transition-transform group-hover:-translate-y-0.5">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M9 6.5h11.5L25 11v14.5H9V6.5Z" fill="#fffdf6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M20.5 6.5V11H25" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M13 15h7M13 19h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6.5 10.5v15h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".45" />
          <path d="m24.5 20.5.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z" fill="#fbe38d" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 leading-none">
        <span className="block font-heading text-[1.35rem] font-bold tracking-tight text-on-surface">Faeyza</span>
        {!compact ? (
          <span className="mt-1 block font-label-caps text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
            Digital Printing Studio
          </span>
        ) : null}
      </span>
    </Link>
  )
}

export default Logo
