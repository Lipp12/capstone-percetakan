import { ArrowDownUp } from 'lucide-react'

export const sortOptions = [
  { id: 'populer', label: 'Paling populer' },
  { id: 'harga-rendah', label: 'Harga terendah' },
  { id: 'harga-tinggi', label: 'Harga tertinggi' },
  { id: 'nama', label: 'Nama A–Z' },
  { id: 'min-order', label: 'Minimal order terkecil' },
]

export function SortSelect({ value, onChange, id = 'sort-produk' }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="hidden font-label-md text-label-md text-on-surface-variant sm:block">
        Urutkan
      </label>
      <div className="relative">
        <ArrowDownUp
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline"
          aria-hidden="true"
        />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-base w-full appearance-none py-2 pl-9 pr-9 font-label-md text-label-md sm:w-auto"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SortSelect
