import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Inbox, RefreshCw, SearchX } from 'lucide-react'
import { AdminFilters } from '../components/admin/AdminFilters'
import { FilePreviewModal } from '../components/admin/FilePreviewModal'
import { OrderDetailModal } from '../components/admin/OrderDetailModal'
import { OrderMetrics } from '../components/admin/OrderMetrics'
import { OrderPagination } from '../components/admin/OrderPagination'
import { OrderTable } from '../components/admin/OrderTable'
import { StatusUpdateModal } from '../components/admin/StatusUpdateModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Toast } from '../components/ui/Toast'
import { useOrders } from '../hooks/useOrders'
import { usePageTitle } from '../hooks/usePageTitle'
import { ORDER_STATUS, STATUS_FILTERS, getStatusMeta } from '../data/orderStatus'
import { getApiErrorMessage, isMockMode, updateOrderStatus } from '../services/api'

const PAGE_SIZE = 8

function matchesQuery(order, query) {
  if (!query) return true
  const haystack = [
    order.code,
    order.id,
    order.customer?.name,
    order.customer?.email,
    order.customer?.phone,
    order.customer?.address,
    order.product?.name,
    order.material,
    order.size,
    order.notes,
    getStatusMeta(order.status).label,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function AdminOrdersPage() {
  usePageTitle('Kelola Pesanan')
  const { orders, setOrders, loading, error, refresh } = useOrders()

  const [statusFilter, setStatusFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [statusAction, setStatusAction] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState(null)

  const counts = useMemo(() => {
    const next = { semua: orders.length }
    STATUS_FILTERS.forEach((filter) => {
      if (filter.id !== 'semua') next[filter.id] = 0
    })
    orders.forEach((order) => {
      if (next[order.status] !== undefined) next[order.status] += 1
    })
    return next
  }, [orders])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders
      .filter((order) => statusFilter === 'semua' || order.status === statusFilter)
      .filter((order) => matchesQuery(order, query))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null

  useEffect(() => {
    setPage(1)
  }, [statusFilter, search])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const closeToast = useCallback(() => setToast(null), [])

  const handleOpenDetail = (order) => {
    setSelectedId(order.id)
    setActionError('')
  }

  const handleCloseDetail = () => {
    if (updating) return
    setSelectedId(null)
    setStatusAction(null)
    setActionError('')
  }

  const requestStatus = (target) => {
    setActionError('')
    setStatusAction({ mode: 'status', target })
  }

  const requestReject = () => {
    setActionError('')
    setStatusAction({ mode: 'reject', target: ORDER_STATUS.DITOLAK })
  }

  const closeStatusAction = () => {
    if (updating) return
    setStatusAction(null)
    setActionError('')
  }

  const handleConfirmStatus = async ({ status, note, rejectReason }) => {
    if (!selectedOrder || updating) return

    const orderId = selectedOrder.id
    const rollback = selectedOrder
    const meta = getStatusMeta(status)
    const optimistic = {
      ...rollback,
      status,
      rejectReason: status === ORDER_STATUS.DITOLAK ? rejectReason : rollback.rejectReason,
      timeline: [
        ...(rollback.timeline ?? []),
        {
          status,
          label: meta.label,
          at: new Date().toISOString(),
          note:
            note ||
            (status === ORDER_STATUS.DITOLAK
              ? rejectReason || 'Pesanan ditolak oleh admin.'
              : `Status diperbarui menjadi ${meta.label}.`),
        },
      ],
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? optimistic : order)))
    setUpdating(true)
    setActionError('')

    try {
      const updated = await updateOrderStatus(orderId, status, { note, rejectReason })
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)))
      setStatusAction(null)
      setToast({
        tone: status === ORDER_STATUS.DITOLAK ? 'error' : 'success',
        message:
          status === ORDER_STATUS.DITOLAK
            ? `Pesanan ${rollback.code} ditolak. Alasan tersimpan di detail pesanan.`
            : `Status ${rollback.code} diperbarui menjadi ${meta.label}.`,
      })
    } catch (err) {
      setOrders((current) => current.map((order) => (order.id === orderId ? rollback : order)))
      setActionError(getApiErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const resetFilters = () => {
    setStatusFilter('semua')
    setSearch('')
    setPage(1)
  }

  const emptyCopy = search.trim()
    ? {
        icon: SearchX,
        title: 'Pesanan tidak ditemukan',
        description: `Tidak ada pesanan yang cocok dengan "${search.trim()}". Coba kata kunci lain atau reset filter.`,
      }
    : statusFilter !== 'semua'
      ? {
          icon: Inbox,
          title: `Belum ada pesanan ${getStatusMeta(statusFilter).shortLabel.toLowerCase()}`,
          description: 'Pilih status lain atau tampilkan semua pesanan untuk melihat antrean lengkap.',
        }
      : {
          icon: Inbox,
          title: 'Belum ada pesanan masuk',
          description: 'Pesanan baru dari formulir pelanggan akan muncul otomatis di antrean ini.',
        }

  const EmptyIcon = emptyCopy.icon

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
            <span className="font-label-caps text-[10px] uppercase tracking-[0.14em] text-secondary">Manajemen penjualan</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
            Semua Pesanan Masuk
          </h1>
          <p className="mt-1 max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Verifikasi berkas, pantau produksi, dan perbarui status pesanan pelanggan secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-tertiary-container px-3 py-1.5 font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" aria-hidden="true" />
            {isMockMode ? 'Demo lokal' : 'Live sync'}
            <span className="font-medium normal-case tracking-normal text-tertiary">
              {isMockMode ? 'localStorage' : 'API terhubung'}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            loading={loading}
            loadingLabel="Memuat…"
            aria-label="Muat ulang daftar pesanan"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Muat ulang
          </Button>
        </div>
      </div>

      <OrderMetrics orders={orders} loading={loading} />

      {error ? (
        <Alert
          tone="error"
          title="Daftar pesanan gagal dimuat"
          action={
            <Button variant="outline" size="sm" onClick={refresh}>
              Coba lagi
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <AdminFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <OrderTable loading orders={[]} onOpenDetail={() => {}} onOpenFile={() => {}} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          title={emptyCopy.title}
          description={emptyCopy.description}
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Tampilkan semua pesanan
            </Button>
          }
        />
      ) : (
        <>
          <OrderTable
            orders={pageItems}
            loading={false}
            onOpenDetail={handleOpenDetail}
            onOpenFile={(file) => setPreviewFile(file)}
          />
          <OrderPagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-3.5 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-outline" aria-hidden="true" />
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          {isMockMode
            ? 'Mode demo aktif: pesanan baru dari formulir pelanggan dan perubahan status disimpan di localStorage browser ini.'
            : 'Perubahan status dikirim ke API. Jika jaringan gagal, tampilan dikembalikan ke status sebelumnya dan data tidak hilang.'}
        </p>
      </div>

      <OrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        updating={updating}
        onClose={handleCloseDetail}
        onOpenFile={(file) => setPreviewFile(file)}
        onRequestStatus={requestStatus}
        onRequestReject={requestReject}
      />

      <StatusUpdateModal
        open={Boolean(statusAction && selectedOrder)}
        mode={statusAction?.mode}
        order={selectedOrder}
        targetStatus={statusAction?.target}
        loading={updating}
        error={actionError}
        onClose={closeStatusAction}
        onConfirm={handleConfirmStatus}
      />

      <FilePreviewModal file={previewFile} open={Boolean(previewFile)} onClose={() => setPreviewFile(null)} />

      <Toast open={Boolean(toast)} tone={toast?.tone} message={toast?.message} onClose={closeToast} />
    </div>
  )
}

export default AdminOrdersPage
