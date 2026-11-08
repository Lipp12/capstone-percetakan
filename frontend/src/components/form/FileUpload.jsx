import { useEffect, useId, useMemo, useState } from 'react'
import { CloudUpload, FileArchive, FileImage, FileText, Trash2, UploadCloud } from 'lucide-react'
import { cn } from '../../utils/cn'
import { fileExtension, formatFileSize, truncateFileName } from '../../utils/format'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/validation'

const acceptAttr = ACCEPTED_FILE_TYPES.map((extension) => `.${extension}`).join(',')

function FileTypeIcon({ name, className }) {
  const extension = fileExtension(name)
  if (['png', 'jpg', 'jpeg'].includes(extension)) return <FileImage className={className} aria-hidden="true" />
  if (['ai', 'psd'].includes(extension)) return <FileArchive className={className} aria-hidden="true" />
  return <FileText className={className} aria-hidden="true" />
}

export function FileUpload({ file, onFile, onRemove, error, disabled = false }) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [dragging, setDragging] = useState(false)

  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith('image/')) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = (nextFile) => {
    if (nextFile) onFile?.(nextFile)
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        id={inputId}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {file ? (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-container/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-primary">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileTypeIcon name={file.name} className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-label-lg text-label-lg text-on-surface" title={file.name}>
                {truncateFileName(file.name, 52)}
              </p>
              <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                {formatFileSize(file.size)} · {fileExtension(file.name).toUpperCase()} siap diperiksa prepress
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-error/40 hover:bg-error-container hover:text-error disabled:opacity-50"
              aria-label={`Hapus berkas ${file.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 font-label-md text-label-md text-primary transition-colors hover:bg-primary-container/40"
          >
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Ganti berkas
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            handleFile(event.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors sm:py-10',
            dragging
              ? 'border-primary bg-primary-container/25'
              : 'border-outline-variant bg-surface-container-low/50 hover:border-primary/60 hover:bg-surface-container-low',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary transition-transform group-hover:scale-105">
            <CloudUpload className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="font-subheading text-subheading font-bold text-on-surface">
            Unggah desain cetak <span className="font-normal text-on-surface-variant">(PDF, AI, PSD, PNG, JPG)</span>
          </span>
          <span className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Tarik & lepas berkas ke area ini, atau klik untuk memilih
          </span>
          <span className="mt-3 flex flex-wrap items-center justify-center gap-2 font-label-caps text-label-caps text-on-surface-variant">
            <span className="rounded bg-surface-container px-2 py-0.5">Min. 300 DPI</span>
            <span className="rounded bg-surface-container px-2 py-0.5">Color CMYK</span>
            <span className="rounded bg-surface-container px-2 py-0.5">Bleed 3 mm</span>
            <span className="rounded bg-surface-container px-2 py-0.5">Maks. {formatFileSize(MAX_FILE_SIZE)}</span>
          </span>
        </label>
      )}

      {error ? (
        <p id={errorId} role="alert" className="font-body-sm text-body-sm font-semibold text-error">
          {error}
        </p>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Format yang diterima: {ACCEPTED_FILE_TYPES.join(', ').toUpperCase()}. Ukuran maksimal 25 MB.
        </p>
      )}
    </div>
  )
}

export default FileUpload
