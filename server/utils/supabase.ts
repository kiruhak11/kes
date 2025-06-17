import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  console.error('SUPABASE_URL is not set in environment variables')
}

if (!process.env.SUPABASE_KEY) {
  console.error('SUPABASE_KEY is not set in environment variables')
}

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || '',
  {
    auth: {
      persistSession: false
    }
  }
) 