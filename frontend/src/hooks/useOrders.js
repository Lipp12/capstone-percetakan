import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchOrders, getApiErrorMessage } from '../services/api'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    setLoading(true)
    setError('')
    try {
      const data = await fetchOrders()
      if (requestId === requestRef.current) setOrders(data)
    } catch (err) {
      if (requestId === requestRef.current) {
        // Surface the API's own message (or a friendly network/timeout hint)
        // instead of Axios' technical "Request failed with status code 500".
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

  return { orders, setOrders, loading, error, refresh: load }
}

export default useOrders
