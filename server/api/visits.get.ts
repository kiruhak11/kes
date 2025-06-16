import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .order('date', { ascending: true })
  if (error) return { error: error.message }
  return { visits: data }
}) 