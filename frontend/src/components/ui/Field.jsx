import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

function describedBy(id, hint, error) {
  const ids = []
  if (hint) ids.push(`${id}-hint`)
  if (error) ids.push(`${id}-error`)
  return ids.length ? ids.join(' ') : undefined
}

function Label({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center justify-between gap-2 font-label-md text-label-md text-on-surface">
      <span>
        {children}
        {required ? (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
    </label>
  )
}

function FieldMessages({ id, hint, error }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="font-body-sm text-body-sm text-on-surface-variant">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-body-sm text-body-sm font-semibold text-error">
          {error}
        </p>
      ) : null}
    </>
  )
}

export const Input = forwardRef(function Input(
  { label, hint, error, required, id: idProp, className, icon: Icon, containerClassName, ...props },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
        ) : null}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn('field-base', Icon && 'pl-10', className)}
          {...props}
        />
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, id: idProp, className, rows = 4, containerClassName, ...props },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn('field-base resize-y', className)}
        {...props}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, hint, error, required, id: idProp, className, children, containerClassName, ...props },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn('field-base cursor-pointer appearance-none', className)}
        {...props}
      >
        {children}
      </select>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  )
})

export default Input
