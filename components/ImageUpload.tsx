'use client'

import { useRef, useState, ChangeEvent, DragEvent } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useUploadImage } from '@/hooks/useUpload'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
}

const MAX_MB    = 5
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = MAX_MB * 1024 * 1024

function validate(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG, or WebP images are allowed'
  if (file.size > MAX_BYTES)        return `File must be under ${MAX_MB}MB`
  return null
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef           = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(value ?? '')
  const [error, setError]     = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const uploadMutation = useUploadImage()

  const processFile = async (file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError('')

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      setUploading(true)
      const result = await uploadMutation.mutateAsync(file)
      onChange(result.url)
      toast.success('Image uploaded!')
    } catch (e) {
      setPreview(value ?? '')
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await processFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 font-medium">Accepted: JPG, PNG, WebP · Max size: {MAX_MB}MB</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill unoptimized className="object-contain mix-blend-multiply p-2" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <span className="text-4xl">🖼️</span>
            <span className="text-sm font-bold text-indigo-600">{uploading ? 'Uploading…' : 'Click or drag to select'}</span>
             <span className="text-xs text-gray-400">drag and drop here</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(',')}
        onChange={handleFile}
        className="hidden"
      />
      {error && <p className="text-xs font-bold text-red-500">{error}</p>}
    </div>
  )
}
