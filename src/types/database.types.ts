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
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category_id: string | null
          visible: boolean
          featured: boolean
          stock: number
          variants: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id?: string | null
          visible?: boolean
          featured?: boolean
          stock?: number
          variants?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: string | null
          visible?: boolean
          featured?: boolean
          stock?: number
          variants?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          whatsapp_number: string | null
          instagram_url: string | null
          shipping_text: string | null
          free_shipping_threshold: number | null
          created_at: string
        }
        Insert: {
          id?: string
          whatsapp_number?: string | null
          instagram_url?: string | null
          shipping_text?: string | null
          free_shipping_threshold?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          whatsapp_number?: string | null
          instagram_url?: string | null
          shipping_text?: string | null
          free_shipping_threshold?: number | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
