export function getImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('preset')) return path
  return `/api/file-storage/userFiles/${path}`
} 