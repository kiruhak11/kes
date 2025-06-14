import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { TablesInsert } from '~/types/database.types'

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
    'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody<{ 
      name: string; 
      description: string; 
      price: number; 
      image?: string;
      category: string;
      extendedDescription?: string;
      specs?: Record<string, any>;
    }>(event)
    
    if (!body.name || !body.description || typeof body.price !== 'number' || !body.category) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Bad Request: name, description, price and category are required' 
      })
    }

    // Ensure specs exist and default power/fuel if not provided
    const newSpecs = body.specs || {};
    if (!newSpecs.power) {
      newSpecs.power = 'отсутствует';
    }
    if (!newSpecs.fuel) {
      newSpecs.fuel = 'отсутствует';
    }

    // Define a more flexible ProductInsert type if TablesInsert is too strict
    type ProductInsert = Omit<TablesInsert<'products'>, 'id'>;

    // Generate category slug
    const categorySlug = transliterate(body.category).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    // Explicitly define the product object to be inserted, excluding 'id'
    const productToInsert: ProductInsert = {
      name: body.name,
      description: body.description,
      price: body.price,
      image: body.image || '/placeholder.jpg',
      category: body.category,
      extendedDescription: body.extendedDescription,
      specs: newSpecs,
      category_slug: categorySlug,
    }

    const { data, error } = await client.from('products')
      .insert([productToInsert])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Failed to create product in Supabase' })
    }

    return data
  } catch (e: any) {
    console.error('POST /api/products error:', e)
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || 'Internal Server Error' })
  }
})
