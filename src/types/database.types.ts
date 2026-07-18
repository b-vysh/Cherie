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
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_insta: string | null
          customer_address: string
          order_notes: string | null
          total_amount: number
          payment_utr: string | null
          payment_proof_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_insta?: string | null
          customer_address: string
          order_notes?: string | null
          total_amount: number
          payment_utr?: string | null
          payment_proof_url?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_insta?: string | null
          customer_address?: string
          order_notes?: string | null
          total_amount?: number
          payment_utr?: string | null
          payment_proof_url?: string | null
          status?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          variant: string | null
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          variant?: string | null
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          variant?: string | null
          quantity?: number
          price?: number
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
          upi_id: string | null
          payee_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          whatsapp_number?: string | null
          instagram_url?: string | null
          shipping_text?: string | null
          free_shipping_threshold?: number | null
          upi_id?: string | null
          payee_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          whatsapp_number?: string | null
          instagram_url?: string | null
          shipping_text?: string | null
          free_shipping_threshold?: number | null
          upi_id?: string | null
          payee_name?: string | null
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
