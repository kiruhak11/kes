import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type Tables = Database['public']['Tables']
export type Categories = Tables['categories']['Row']
export type Products = Tables['products']['Row']