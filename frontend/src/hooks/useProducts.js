import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchProducts, getApiErrorMessage } from '../services/api'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    setLoading(true)
    setError('')
    try {
      const data = await fetchProducts()
      if (requestId === requestRef.current) setProducts(data)
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(getApiErrorMessage(err))
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return () => {
      requestRef.current += 1
    }
  }, [load])

  return { products, loading, error, retry: load }
}

export default useProducts
