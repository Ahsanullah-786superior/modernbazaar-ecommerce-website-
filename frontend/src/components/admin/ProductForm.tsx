'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { Product, Category } from '@/types'
import { productsApi, categoriesApi } from '@/lib/api'

interface ProductFormProps {
  product?: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  tags: string[]
  stock: number
  featured: boolean
  images: string[]
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  compareAtPrice: undefined,
  category: '',
  tags: [],
  stock: 0,
  featured: false,
  images: [],
}

export default function ProductForm({ product, isOpen, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getAll()
        setCategories(response.data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    if (isOpen) loadCategories()
  }, [isOpen])

  // Populate form when editing
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        category: product.category._id,
        tags: product.tags,
        stock: product.stock,
        featured: product.featured,
        images: product.images || [],
      })
      setError(null)
    } else if (!product && isOpen) {
      setFormData(initialFormData)
      setError(null)
    }
  }, [product, isOpen])

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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
      setError('Product name is required')
      return
    }
    if (!formData.slug.trim()) {
      setError('Slug is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }
    if (!formData.category) {
      setError('Category is required')
      return
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0')
      return
    }
    
    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        featured: formData.featured,
        tags: formData.tags,
        images: formData.images,
        ...(formData.compareAtPrice !== undefined && { compareAtPrice: formData.compareAtPrice }),
      }

      if (product) {
        await productsApi.update(product._id, submitData)
      } else {
        await productsApi.create(submitData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save product'
      setError(errorMessage)
      console.error('Failed to save product:', error)
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
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Name and Slug */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={generateSlug}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
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
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                required
              />
            </div>

            {/* Price and Compare At Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Compare At Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice || ''}
                  onChange={(e) => handleInputChange('compareAtPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Category and Stock */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB per image
                      const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB total
                      
                      Array.from(files).forEach(file => {
                        // Validate file size
                        if (file.size > MAX_FILE_SIZE) {
                          setError(`Image "${file.name}" is too large. Max 2MB per image.`)
                          return
                        }
                        
                        // Check total size
                        const totalSize = formData.images.reduce((sum, img) => {
                          const sizeInBytes = img.length * 0.75 // rough estimate for base64
                          return sum + sizeInBytes
                        }, 0)
                        
                        if (totalSize + file.size > MAX_TOTAL_SIZE) {
                          setError('Total image size exceeds 10MB limit.')
                          return
                        }
                        
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string
                          if (!formData.images.includes(imageUrl)) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images, imageUrl]
                            }))
                            setError(null)
                          }
                        }
                        reader.onerror = () => {
                          setError(`Failed to read file "${file.name}"`)
                        }
                        reader.readAsDataURL(file)
                      })
                    }
                  }}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">Upload product images (JPG, PNG, etc.) - Max 2MB per image, 10MB total</p>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))
                        }}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Product
              </label>
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
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}