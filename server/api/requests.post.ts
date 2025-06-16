import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Ожидаем поля: phone, region, typeBuilding, fuelType, powerType, raw_text
  const { phone, region, typeBuilding, fuelType, powerType, raw_text } = body
  const { error } = await supabase.from('requests').insert([
    { phone, region, typeBuilding, fuelType, powerType, raw_text }
  ])
  if (error) return { error: error.message }
  return { success: true }
}) 