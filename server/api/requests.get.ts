import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return { requests: data }
}) 