import {
  BookOpen,
  Contact,
  CreditCard,
  FileStack,
  Flag,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  Package,
  ShoppingBag,
  Sticker,
} from 'lucide-react'

const iconMap = {
  semua: LayoutGrid,
  'kartu-nama': Contact,
  brosur: BookOpen,
  banner: Flag,
  stiker: Sticker,
  kemasan: Package,
  undangan: Mail,
  poster: ImageIcon,
  'id-card': CreditCard,
  dokumen: FileStack,
  merchandise: ShoppingBag,
}

export function getCategoryIcon(categoryId) {
  return iconMap[categoryId] ?? LayoutGrid
}

export function CategoryNav({ categories, active, onChange }) {
  return (
    <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter kategori produk">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.id)
        const isActive = active === category.id
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={isActive}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 font-label-lg text-label-lg transition-all ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[2px_2px_0px_#1c1c19]'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {category.label}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryNav
