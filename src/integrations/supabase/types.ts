export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audiences: {
        Row: {
          audience_slot_time: string | null
          central_region_type: string | null
          confirmed_by_unit: boolean | null
          created_at: string
          defendant_name: string
          defender_id: string | null
          id: string
          judicial_assistant_id: string | null
          magistrate_id: string | null
          observations: string | null
          police_officer_id: string | null
          prison_unit_id: string
          process_number: string
          prosecutor_id: string | null
          scheduled_date: string
          scheduled_time: string
          serventia_id: string
          status: Database["public"]["Enums"]["audience_status"]
          unit_acknowledgment: string | null
          updated_at: string
          virtual_room_url: string | null
        }
        Insert: {
          audience_slot_time?: string | null
          central_region_type?: string | null
          confirmed_by_unit?: boolean | null
          created_at?: string
          defendant_name: string
          defender_id?: string | null
          id?: string
          judicial_assistant_id?: string | null
          magistrate_id?: string | null
          observations?: string | null
          police_officer_id?: string | null
          prison_unit_id: string
          process_number: string
          prosecutor_id?: string | null
          scheduled_date: string
          scheduled_time: string
          serventia_id: string
          status?: Database["public"]["Enums"]["audience_status"]
          unit_acknowledgment?: string | null
          updated_at?: string
          virtual_room_url?: string | null
        }
        Update: {
          audience_slot_time?: string | null
          central_region_type?: string | null
          confirmed_by_unit?: boolean | null
          created_at?: string
          defendant_name?: string
          defender_id?: string | null
          id?: string
          judicial_assistant_id?: string | null
          magistrate_id?: string | null
          observations?: string | null
          police_officer_id?: string | null
          prison_unit_id?: string
          process_number?: string
          prosecutor_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          serventia_id?: string
          status?: Database["public"]["Enums"]["audience_status"]
          unit_acknowledgment?: string | null
          updated_at?: string
          virtual_room_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audiences_defender_id_fkey"
            columns: ["defender_id"]
            isOneToOne: false
            referencedRelation: "defenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_judicial_assistant_id_fkey"
            columns: ["judicial_assistant_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_magistrate_id_fkey"
            columns: ["magistrate_id"]
            isOneToOne: false
            referencedRelation: "magistrates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_prison_unit_id_fkey"
            columns: ["prison_unit_id"]
            isOneToOne: false
            referencedRelation: "prison_units_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_prosecutor_id_fkey"
            columns: ["prosecutor_id"]
            isOneToOne: false
            referencedRelation: "prosecutors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_serventia_id_fkey"
            columns: ["serventia_id"]
            isOneToOne: false
            referencedRelation: "serventias"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          active: boolean | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          linked_magistrate_id: string | null
          mobile: string | null
          name: string
          phone: string | null
          profile: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          linked_magistrate_id?: string | null
          mobile?: string | null
          name: string
          phone?: string | null
          profile?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          linked_magistrate_id?: string | null
          mobile?: string | null
          name?: string
          phone?: string | null
          profile?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_linked_magistrate_id_fkey"
            columns: ["linked_magistrate_id"]
            isOneToOne: false
            referencedRelation: "magistrates"
            referencedColumns: ["id"]
          },
        ]
      }
      defenders: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          registration: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      magistrates: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          id: string
          judicial_assistant_id: string | null
          name: string
          phone: string | null
          updated_at: string
          virtual_room_url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          judicial_assistant_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          virtual_room_url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          judicial_assistant_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          virtual_room_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magistrates_judicial_assistant_id_fkey"
            columns: ["judicial_assistant_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          target_user_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          target_user_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          target_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      prison_units_extended: {
        Row: {
          address: string
          comarca: string
          created_at: string
          director: string
          email: string
          functional: string
          id: string
          landline: string
          municipalities: string
          name: string
          number_of_rooms: number
          responsible: string
          short_name: string
          type: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address: string
          comarca: string
          created_at?: string
          director: string
          email: string
          functional: string
          id?: string
          landline: string
          municipalities: string
          name: string
          number_of_rooms?: number
          responsible: string
          short_name: string
          type: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          address?: string
          comarca?: string
          created_at?: string
          director?: string
          email?: string
          functional?: string
          id?: string
          landline?: string
          municipalities?: string
          name?: string
          number_of_rooms?: number
          responsible?: string
          short_name?: string
          type?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      prosecutors: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          created_at: string
          defender_id: string | null
          id: string
          judicial_assistant_id: string | null
          magistrate_id: string | null
          prosecutor_id: string | null
          schedule_id: string
          serventia_id: string
          shift: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          defender_id?: string | null
          id?: string
          judicial_assistant_id?: string | null
          magistrate_id?: string | null
          prosecutor_id?: string | null
          schedule_id: string
          serventia_id: string
          shift: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          defender_id?: string | null
          id?: string
          judicial_assistant_id?: string | null
          magistrate_id?: string | null
          prosecutor_id?: string | null
          schedule_id?: string
          serventia_id?: string
          shift?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_defender_id_fkey"
            columns: ["defender_id"]
            isOneToOne: false
            referencedRelation: "defenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_judicial_assistant_id_fkey"
            columns: ["judicial_assistant_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_magistrate_id_fkey"
            columns: ["magistrate_id"]
            isOneToOne: false
            referencedRelation: "magistrates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_prosecutor_id_fkey"
            columns: ["prosecutor_id"]
            isOneToOne: false
            referencedRelation: "prosecutors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_serventia_id_fkey"
            columns: ["serventia_id"]
            isOneToOne: false
            referencedRelation: "serventias"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      serventias: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          phone: string | null
          responsible: string | null
          type: Database["public"]["Enums"]["serventia_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          responsible?: string | null
          type: Database["public"]["Enums"]["serventia_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          responsible?: string | null
          type?: Database["public"]["Enums"]["serventia_type"]
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          changes: Json | null
          description: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          timestamp: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_permission: {
        Args: { resource_name: string; action_name: string }
        Returns: boolean
      }
    }
    Enums: {
      audience_status: "agendada" | "realizada" | "cancelada" | "nao_compareceu"
      serventia_type: "macrorregiao" | "central_custodia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audience_status: ["agendada", "realizada", "cancelada", "nao_compareceu"],
      serventia_type: ["macrorregiao", "central_custodia"],
    },
  },
} as const
