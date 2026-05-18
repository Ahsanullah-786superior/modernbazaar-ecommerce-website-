'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { Category } from '@/types'
import { categoriesApi } from '@/lib/api'

interface CategoryFormProps {
  category?: Category | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
  image: string
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image: '',
}

export default function CategoryForm({ category, isOpen, onClose, onSuccess }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      })
      setError(null)
    } else if (!category && isOpen) {
      setFormData(initialFormData)
      setError(null)
    }
  }, [category, isOpen])

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    handleInputChange('slug', slug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }
    if (!formData.slug.trim()) {
      setError('Slug is required')
      return
    }
    if (!formData.image.trim()) {
      setError('Image is required')
      return
    }
    
    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
      }

      if (category) {
        await categoriesApi.update(category._id, submitData)
      } else {
        await categoriesApi.create(submitData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save category'
      setError(errorMessage)
      console.error('Failed to save category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={generateSlug}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Category Image</label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
                      if (file.size > MAX_FILE_SIZE) {
                        setError(`Image is too large. Max 2MB.`)
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const imageUrl = event.target?.result as string
                        setFormData(prev => ({ ...prev, image: imageUrl }))
                        setError(null)
                      }
                      reader.onerror = () => {
                        setError(`Failed to read file`)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">Upload category image (JPG, PNG) - Max 2MB</p>
              </div>
              {formData.image && (
                <div className="relative group w-full h-32">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
