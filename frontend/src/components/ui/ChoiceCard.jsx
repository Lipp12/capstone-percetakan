import { cn } from '../../utils/cn'

export function ChoiceCard({
  type = 'radio',
  name,
  value,
  checked,
  onChange,
  title,
  description,
  meta,
  disabled = false,
  className,
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer flex-col justify-between gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5 transition-all',
        'hover:border-outline hover:bg-surface-container',
        'has-[:checked]:border-primary has-[:checked]:bg-primary-container/20 has-[:checked]:shadow-[0_0_0_2px_#6e5d15]',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-outline bg-surface-container-lowest',
            type === 'radio' ? 'rounded-full' : 'rounded',
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'bg-primary transition-transform',
              type === 'radio' ? 'h-2 w-2 rounded-full' : 'h-2.5 w-2.5 rounded-[2px]',
              checked ? 'scale-100' : 'scale-0',
            )}
          />
        </span>
        <span className="min-w-0">
          <span className="block font-label-lg text-label-lg text-on-surface">{title}</span>
          {description ? (
            <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">{description}</span>
          ) : null}
        </span>
      </div>
      {meta ? (
        <span className="ml-7 block border-t border-outline-variant/40 pt-2 text-right font-label-md text-label-md text-on-surface-variant">
          {meta}
        </span>
      ) : null}
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  )
}

export default ChoiceCard
