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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      global_oxygen: {
        Row: {
          bonus_active_until: string | null
          date: string
          id: string
          target_count: number
          water_count: number
        }
        Insert: {
          bonus_active_until?: string | null
          date?: string
          id?: string
          target_count?: number
          water_count?: number
        }
        Update: {
          bonus_active_until?: string | null
          date?: string
          id?: string
          target_count?: number
          water_count?: number
        }
        Relationships: []
      }
      grove_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          display_name: string
          id: string
          is_withered: boolean | null
          user_id: string
          vine_species: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          display_name?: string
          id?: string
          is_withered?: boolean | null
          user_id: string
          vine_species?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          display_name?: string
          id?: string
          is_withered?: boolean | null
          user_id?: string
          vine_species?: string | null
        }
        Relationships: []
      }
      sunshine_nudges: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          created_at: string
          duration: number
          energy_level: string | null
          id: string
          is_completed: boolean
          start_time: string
          subtasks: Json | null
          task_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          duration?: number
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          start_time: string
          subtasks?: Json | null
          task_date?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          duration?: number
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          start_time?: string
          subtasks?: Json | null
          task_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          aura_score: number
          avatar_url: string | null
          badges: Json | null
          created_at: string
          current_theme: string
          daily_streak: number
          display_name: string | null
          glimmer_until: string | null
          has_completed_onboarding: boolean
          id: string
          last_active_date: string | null
          last_seen: string | null
          last_watered_date: string | null
          streak_frozen: boolean | null
          sunshine_nudges_sent: number
          updated_at: string
          user_id: string
          vine_species: string
        }
        Insert: {
          aura_score?: number
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          current_theme?: string
          daily_streak?: number
          display_name?: string | null
          glimmer_until?: string | null
          has_completed_onboarding?: boolean
          id?: string
          last_active_date?: string | null
          last_seen?: string | null
          last_watered_date?: string | null
          streak_frozen?: boolean | null
          sunshine_nudges_sent?: number
          updated_at?: string
          user_id: string
          vine_species?: string
        }
        Update: {
          aura_score?: number
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          current_theme?: string
          daily_streak?: number
          display_name?: string | null
          glimmer_until?: string | null
          has_completed_onboarding?: boolean
          id?: string
          last_active_date?: string | null
          last_seen?: string | null
          last_watered_date?: string | null
          streak_frozen?: boolean | null
          sunshine_nudges_sent?: number
          updated_at?: string
          user_id?: string
          vine_species?: string
        }
        Relationships: []
      }
      user_watering_log: {
        Row: {
          created_at: string
          id: string
          user_id: string
          watered_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          watered_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          watered_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_profiles_public: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          last_seen: string | null
          user_id: string | null
          vine_species: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          last_seen?: string | null
          user_id?: string | null
          vine_species?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          last_seen?: string | null
          user_id?: string | null
          vine_species?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_active_gardeners_count: { Args: never; Returns: number }
      get_online_founders: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          vine_species: string
        }[]
      }
      has_watered_today: { Args: never; Returns: boolean }
      increment_global_oxygen: { Args: never; Returns: Json }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      sanitize_text: {
        Args: { input_text: string; max_length?: number }
        Returns: string
      }
      update_last_seen: { Args: never; Returns: undefined }
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
