import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    const categoryId = event.context.params?.category

    if (!categoryId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Category ID is required' 
      })
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.title) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Title is required' 
      })
    }

    // Generate slug if not provided
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await client
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (fetchError) {
      console.error('Error fetching category:', fetchError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch category' 
      })
    }

    if (!existingCategory) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Category not found' 
      })
    }

    // Check if slug is unique (excluding current category)
    const { data: slugCheck, error: slugError } = await client
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', categoryId)
      .single()

    if (slugError && slugError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking slug uniqueness:', slugError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to check slug uniqueness' 
      })
    }

    if (slugCheck) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'A category with this slug already exists' 
      })
    }

    // Update the category
    const { data: updatedCategory, error: updateError } = await client
      .from('categories')
      .update({
        name: body.title,
        description: body.description || null,
        slug: slug
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating category:', updateError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to update category' 
      })
    }

    return updatedCategory
  } catch (e: any) {
    console.error('PUT /api/categories/[category] error:', e)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Internal Server Error' 
    })
  }
}) 