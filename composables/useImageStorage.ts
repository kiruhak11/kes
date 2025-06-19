export function useImageStorage() {
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload image')
      }
      
      const data = await response.json()
      return data.path
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    try {
      const uploadPromises = files.map(file => uploadImage(file))
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw error
    }
  }

  const deleteImage = async (path: string): Promise<void> => {
    try {
      const response = await fetch(`/api/upload/image?path=${encodeURIComponent(path)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  const getImageUrl = (path: string): string => {
    if (!path) return ''
    if (path.startsWith('http') || path.startsWith('/') || path.startsWith('preset')) return path
    return `/uploads/userFiles/${path}`
  }

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getImageUrl
  }
} 