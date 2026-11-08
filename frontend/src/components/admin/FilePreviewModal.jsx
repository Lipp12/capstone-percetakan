import { Download, ExternalLink, FileArchive, FileImage, FileText, ImageOff } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { resolveFileUrl } from '../../services/api'
import { fileExtension, formatFileSize, truncateFileName } from '../../utils/format'

function previewKind(file) {
  const extension = fileExtension(file?.name)
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  return 'other'
}

export function FilePreviewModal({ file, open, onClose }) {
  const url = resolveFileUrl(file?.url)
  const kind = previewKind(file)
  const extension = fileExtension(file?.name).toUpperCase() || 'FILE'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pratinjau berkas desain"
      description={file ? `${truncateFileName(file.name, 60)} · ${formatFileSize(file.size)}` : undefined}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Tutup
          </button>
          {file && url ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Buka tab baru
              </a>
              <a
                href={url}
                download={file.name}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-on-surface bg-primary-container px-4 py-2.5 font-label-lg text-label-lg text-on-primary-container shadow-hard transition-all hover:-translate-x-px hover:-translate-y-px"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Unduh berkas
              </a>
            </>
          ) : null}
        </>
      }
    >
      {!file ? (
        <EmptyState
          icon={FileText}
          title="Tidak ada berkas"
          description="Pesanan ini belum memiliki berkas desain yang bisa dipratinjau."
        />
      ) : !url ? (
        <EmptyState icon={ImageOff} title="Berkas tidak tersedia" description="URL berkas kosong atau tidak dapat dibaca." />
      ) : kind === 'image' ? (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-low p-2">
          <img
            src={url}
            alt={`Pratinjau berkas ${file.name}`}
            className="mx-auto max-h-[62vh] w-auto rounded-xl object-contain"
          />
        </div>
      ) : kind === 'pdf' ? (
        <div className="flex flex-col gap-2">
          <iframe
            src={url}
            title={`Pratinjau PDF ${file.name}`}
            className="h-[62vh] w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low"
          />
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pratinjau menggunakan penampil PDF bawaan browser. Jika tidak muncul, gunakan tombol buka tab baru atau unduh.
          </p>
        </div>
      ) : (
        <EmptyState
          icon={extension === 'AI' || extension === 'PSD' ? FileArchive : FileImage}
          title={`Pratinjau ${extension} belum didukung`}
          description="Berkas desain sumber tetap bisa diunduh dan diperiksa dengan aplikasi desain di komputer admin."
        />
      )}
    </Modal>
  )
}

export default FilePreviewModal
