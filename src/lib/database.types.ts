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
      blockchain: {
        Row: {
          id: string
          block_index: number
          timestamp: string
          data: Json
          previous_hash: string
          hash: string
          nonce: number
          created_at: string
        }
        Insert: {
          id?: string
          block_index: number
          timestamp: string
          data: Json
          previous_hash: string
          hash: string
          nonce: number
          created_at?: string
        }
        Update: {
          id?: string
          block_index?: number
          timestamp?: string
          data?: Json
          previous_hash?: string
          hash?: string
          nonce?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          user_type: 'donor' | 'recipient' | 'admin'
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          bio: string | null
          avatar_url: string | null
          wallet_address: string | null
          wallet_balance: number
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          user_type: 'donor' | 'recipient' | 'admin'
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          bio?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          wallet_balance?: number
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          user_type?: 'donor' | 'recipient' | 'admin'
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          bio?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          wallet_balance?: number
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          amount: number
          donation_id: string | null
          blockchain_hash: string | null
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          amount: number
          donation_id?: string | null
          blockchain_hash?: string | null
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          amount?: number
          donation_id?: string | null
          blockchain_hash?: string | null
          description?: string
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action_type: string
          target_user_id: string | null
          target_resource_type: string | null
          target_resource_id: string | null
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action_type: string
          target_user_id?: string | null
          target_resource_type?: string | null
          target_resource_id?: string | null
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action_type?: string
          target_user_id?: string | null
          target_resource_type?: string | null
          target_resource_id?: string | null
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          title: string
          description: string
          quantity: number
          brand: string | null
          pad_type: string
          status: 'available' | 'reserved' | 'completed' | 'cancelled'
          expiry_date: string | null
          pickup_delivery: 'pickup' | 'delivery' | 'both'
          location: string
          reserved_by: string | null
          reserved_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          title: string
          description: string
          quantity: number
          brand?: string | null
          pad_type: string
          status?: 'available' | 'reserved' | 'completed' | 'cancelled'
          expiry_date?: string | null
          pickup_delivery: 'pickup' | 'delivery' | 'both'
          location: string
          reserved_by?: string | null
          reserved_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          title?: string
          description?: string
          quantity?: number
          brand?: string | null
          pad_type?: string
          status?: 'available' | 'reserved' | 'completed' | 'cancelled'
          expiry_date?: string | null
          pickup_delivery?: 'pickup' | 'delivery' | 'both'
          location?: string
          reserved_by?: string | null
          reserved_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          recipient_id: string
          title: string
          description: string
          quantity_needed: number
          pad_type_preference: string | null
          urgency: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'matched' | 'fulfilled' | 'cancelled'
          matched_donation_id: string | null
          fulfilled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          title: string
          description: string
          quantity_needed: number
          pad_type_preference?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'matched' | 'fulfilled' | 'cancelled'
          matched_donation_id?: string | null
          fulfilled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          title?: string
          description?: string
          quantity_needed?: number
          pad_type_preference?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'matched' | 'fulfilled' | 'cancelled'
          matched_donation_id?: string | null
          fulfilled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      educational_content: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          category: 'health' | 'hygiene' | 'myths' | 'products' | 'general'
          image_url: string | null
          is_published: boolean
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          category: 'health' | 'hygiene' | 'myths' | 'products' | 'general'
          image_url?: string | null
          is_published?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          category?: 'health' | 'hygiene' | 'myths' | 'products' | 'general'
          image_url?: string | null
          is_published?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          donation_id: string | null
          request_id: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          donation_id?: string | null
          request_id?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          donation_id?: string | null
          request_id?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          donation_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
