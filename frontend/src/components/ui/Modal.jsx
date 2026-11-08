import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Tracks every open dialog (in mount order) so stacked modals only respond to
// Escape/Tab through the top-most one. Without this, pressing Escape inside a
// file preview would also close the order detail dialog underneath it.
const modalStack = []

export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const token = {}
    modalStack.push(token)

    const previouslyFocused = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const focusable = panel ? Array.from(panel.querySelectorAll(FOCUSABLE)) : []
    const first = focusable[0] ?? panel
    first?.focus?.()

    const isTopMost = () => modalStack[modalStack.length - 1] === token

    const handleKeyDown = (event) => {
      if (!isTopMost()) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      const wasTopMost = isTopMost()
      const index = modalStack.indexOf(token)
      if (index !== -1) modalStack.splice(index, 1)
      document.removeEventListener('keydown', handleKeyDown)
      // Keep the page locked while another dialog is still open.
      document.body.style.overflow = modalStack.length ? 'hidden' : originalOverflow
      if (wasTopMost) previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-outline-variant/60 bg-surface-container-lowest shadow-modal animate-fade-up sm:rounded-3xl',
          sizes[size] ?? sizes.md,
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-container px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="font-headline-sm text-headline-sm text-on-surface">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-surface-container bg-surface-container-low/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
