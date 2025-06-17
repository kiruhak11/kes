export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string | null
          description: string | null
          extendedDescription: string | null
          price: number | null
          image: string | null
          category: string | null
          category_slug: string | null
          specs: Json
        }
        Insert: {
          id?: number
          name?: string | null
          description?: string | null
          extendedDescription?: string | null
          price?: number | null
          image?: string | null
          category?: string | null
          category_slug?: string | null
          specs?: Json
        }
        Update: {
          id?: number
          name?: string | null
          description?: string | null
          extendedDescription?: string | null
          price?: number | null
          image?: string | null
          category?: string | null
          category_slug?: string | null
          specs?: Json
        }
      }
      visits: {
        Row: {
          id: number
          date: string
          count: number
        }
        Insert: {
          id?: number
          date: string
          count: number
        }
        Update: {
          id?: number
          date?: string
          count?: number
        }
      }
      requests: {
        Row: {
          id: number
          type: string
          status: string
          phone: string
          region: string
          type_building: string
          fuel_type: string
          power_type: string
          raw_text: string
          created_at: string
        }
        Insert: {
          id?: number
          type: string
          status: string
          phone: string
          region: string
          type_building: string
          fuel_type: string
          power_type: string
          raw_text: string
          created_at?: string
        }
        Update: {
          id?: number
          type?: string
          status?: string
          phone?: string
          region?: string
          type_building?: string
          fuel_type?: string
          power_type?: string
          raw_text?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 