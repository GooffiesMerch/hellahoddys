export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      backend_secrets: {
        Row: {
          name: string
          secret: string
        }
        Insert: {
          name: string
          secret: string
        }
        Update: {
          name?: string
          secret?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid: number
          carrier: string | null
          created_at: string
          currency: string
          email: string
          id: string
          items: Json
          payment_status: string
          paypal_order_id: string | null
          printful_order_id: number | null
          printful_payload: Json | null
          recipient: Json
          shipping_cost: number
          shipping_method: string | null
          status: string
          stripe_session_id: string | null
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          carrier?: string | null
          created_at?: string
          currency?: string
          email: string
          id?: string
          items: Json
          payment_status?: string
          paypal_order_id?: string | null
          printful_order_id?: number | null
          printful_payload?: Json | null
          recipient: Json
          shipping_cost?: number
          shipping_method?: string | null
          status?: string
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          carrier?: string | null
          created_at?: string
          currency?: string
          email?: string
          id?: string
          items?: Json
          payment_status?: string
          paypal_order_id?: string | null
          printful_order_id?: number | null
          printful_payload?: Json | null
          recipient?: Json
          shipping_cost?: number
          shipping_method?: string | null
          status?: string
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      printful_products: {
        Row: {
          external_id: string | null
          id: number
          name: string
          store_id: number | null
          store_name: string | null
          synced_at: string
          thumbnail_url: string | null
          variant_count: number
        }
        Insert: {
          external_id?: string | null
          id: number
          name: string
          store_id?: number | null
          store_name?: string | null
          synced_at?: string
          thumbnail_url?: string | null
          variant_count?: number
        }
        Update: {
          external_id?: string | null
          id?: number
          name?: string
          store_id?: number | null
          store_name?: string | null
          synced_at?: string
          thumbnail_url?: string | null
          variant_count?: number
        }
        Relationships: []
      }
      printful_variants: {
        Row: {
          availability: string | null
          color: string | null
          currency: string | null
          external_id: string | null
          id: number
          name: string
          product_id: number
          retail_price: number | null
          size: string | null
          sku: string | null
          store_id: number | null
          synced_at: string
          thumbnail_url: string | null
        }
        Insert: {
          availability?: string | null
          color?: string | null
          currency?: string | null
          external_id?: string | null
          id: number
          name: string
          product_id: number
          retail_price?: number | null
          size?: string | null
          sku?: string | null
          store_id?: number | null
          synced_at?: string
          thumbnail_url?: string | null
        }
        Update: {
          availability?: string | null
          color?: string | null
          currency?: string | null
          external_id?: string | null
          id?: number
          name?: string
          product_id?: number
          retail_price?: number | null
          size?: string | null
          sku?: string | null
          store_id?: number | null
          synced_at?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printful_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "printful_products"
            referencedColumns: ["id"]
          },
        ]
      }
      printful_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string | null
          id: string
          printful_order_id: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type?: string | null
          id?: string
          printful_order_id?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string | null
          id?: string
          printful_order_id?: number | null
        }
        Relationships: []
      }
      printful_webhook_logs: {
        Row: {
          created_at: string
          event_type: string | null
          id: string
          note: string | null
          ok: boolean
          payload: Json | null
          printful_order_id: number | null
          received_at: string
          status_code: number
        }
        Insert: {
          created_at?: string
          event_type?: string | null
          id?: string
          note?: string | null
          ok?: boolean
          payload?: Json | null
          printful_order_id?: number | null
          received_at?: string
          status_code: number
        }
        Update: {
          created_at?: string
          event_type?: string | null
          id?: string
          note?: string | null
          ok?: boolean
          payload?: Json | null
          printful_order_id?: number | null
          received_at?: string
          status_code?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backend_auth: { Args: { p_secret: string }; Returns: undefined }
      backend_create_order: {
        Args: { p_order: Json; p_secret: string }
        Returns: string
      }
      backend_delete_products: {
        Args: { p_ids: number[]; p_secret: string }
        Returns: undefined
      }
      backend_get_order: {
        Args: { p_id: string; p_secret: string }
        Returns: Json
      }
      backend_get_order_by_session: {
        Args: { p_secret: string; p_session_id: string }
        Returns: Json
      }
      backend_list_orders: {
        Args: { p_limit?: number; p_secret: string }
        Returns: Json
      }
      backend_list_webhook_logs: {
        Args: { p_limit?: number; p_secret: string }
        Returns: Json
      }
      backend_log_webhook: {
        Args: {
          p_event_type: string
          p_note: string
          p_ok: boolean
          p_payload: Json
          p_printful_order_id: number
          p_secret: string
          p_status_code: number
        }
        Returns: undefined
      }
      backend_record_webhook_event: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_printful_order_id: number
          p_secret: string
        }
        Returns: boolean
      }
      backend_update_order: {
        Args: { p_id: string; p_patch: Json; p_secret: string }
        Returns: undefined
      }
      backend_update_order_tracking: {
        Args: {
          p_carrier: string
          p_printful_order_id: number
          p_secret: string
          p_status: string
          p_tracking_number: string
          p_tracking_url: string
        }
        Returns: undefined
      }
      backend_upsert_products: {
        Args: { p_rows: Json; p_secret: string }
        Returns: undefined
      }
      backend_upsert_variants: {
        Args: { p_rows: Json; p_secret: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
