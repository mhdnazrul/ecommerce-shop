import { useMutation } from '@tanstack/react-query'

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Upload failed')
      return json.data as { url: string; publicId: string }
    },
  })
}
