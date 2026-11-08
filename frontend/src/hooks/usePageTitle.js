import { useEffect } from 'react'

const BRAND = 'Faeyza Digital Printing Studio'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BRAND}` : BRAND
  }, [title])
}

export default usePageTitle
