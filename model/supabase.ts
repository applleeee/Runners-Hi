export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Content: {
        Row: {
          comment: string | null
          created_at: string
          end_time: string
          gpx_data: Json
          id: string
          image_urls: string[]
          pace: number
          start_time: string
          title: string
          total_distance: number
          type_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          end_time: string
          gpx_data: Json
          id?: string
          image_urls?: string[]
          pace: number
          start_time: string
          title: string
          total_distance: number
          type_id: number
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          end_time?: string
          gpx_data?: Json
          id?: string
          image_urls?: string[]
          pace?: number
          start_time?: string
          title?: string
          total_distance?: number
          type_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Content_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "ContentType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ContentLocation: {
        Row: {
          content_id: string
          created_at: string
          id: number
          location_id: number
          type: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: number
          location_id: number
          type: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: number
          location_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ContentLocation_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "Content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ContentLocation_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
        ]
      }
      ContentType: {
        Row: {
          created_at: string
          depth: number
          id: number
          name: string
          parent_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          depth?: number
          id?: number
          name: string
          parent_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          depth?: number
          id?: number
          name?: string
          parent_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ContentType_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ContentType"
            referencedColumns: ["id"]
          },
        ]
      }
      Location: {
        Row: {
          address: string | null
          created_at: string
          id: number
          kakao_place_id: string | null
          lat: number | null
          lng: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: number
          kakao_place_id?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: number
          kakao_place_id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          created_at: string
          id: string
          nickname: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nickname: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string
          updated_at?: string | null
        }
        Relationships: []
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

