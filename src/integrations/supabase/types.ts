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
          confirmed_by_unit: boolean | null
          created_at: string
          defendant_document: string | null
          defendant_name: string
          defender_id: string | null
          duration_minutes: number | null
          id: string
          magistrate_id: string | null
          observations: string | null
          police_officer_id: string | null
          prison_unit_id: string
          process_number: string
          prosecutor_id: string | null
          region_id: string
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["audience_status"]
          unit_confirmed: boolean | null
          unit_confirmed_at: string | null
          unit_confirmed_by: string | null
          updated_at: string
          virtual_room_url: string | null
        }
        Insert: {
          confirmed_by_unit?: boolean | null
          created_at?: string
          defendant_document?: string | null
          defendant_name: string
          defender_id?: string | null
          duration_minutes?: number | null
          id?: string
          magistrate_id?: string | null
          observations?: string | null
          police_officer_id?: string | null
          prison_unit_id: string
          process_number: string
          prosecutor_id?: string | null
          region_id: string
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["audience_status"]
          unit_confirmed?: boolean | null
          unit_confirmed_at?: string | null
          unit_confirmed_by?: string | null
          updated_at?: string
          virtual_room_url?: string | null
        }
        Update: {
          confirmed_by_unit?: boolean | null
          created_at?: string
          defendant_document?: string | null
          defendant_name?: string
          defender_id?: string | null
          duration_minutes?: number | null
          id?: string
          magistrate_id?: string | null
          observations?: string | null
          police_officer_id?: string | null
          prison_unit_id?: string
          process_number?: string
          prosecutor_id?: string | null
          region_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["audience_status"]
          unit_confirmed?: boolean | null
          unit_confirmed_at?: string | null
          unit_confirmed_by?: string | null
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
            foreignKeyName: "audiences_magistrate_id_fkey"
            columns: ["magistrate_id"]
            isOneToOne: false
            referencedRelation: "magistrates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_police_officer_id_fkey"
            columns: ["police_officer_id"]
            isOneToOne: false
            referencedRelation: "police_officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiences_prison_unit_id_fkey"
            columns: ["prison_unit_id"]
            isOneToOne: false
            referencedRelation: "prison_units"
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
            foreignKeyName: "audiences_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
          mobile: string | null
          name: string
          phone: string | null
          position: string | null
          region_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          name: string
          phone?: string | null
          position?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
          name: string
          phone: string | null
          registration: string | null
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
          updated_at?: string
        }
        Relationships: []
      }
      police_officers: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          rank: string | null
          registration: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          rank?: string | null
          registration?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rank?: string | null
          registration?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "police_officers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "prison_units"
            referencedColumns: ["id"]
          },
        ]
      }
      prison_units: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string
          id: string
          name: string
          phone: string | null
          region_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          region_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prison_units_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      prosecutors: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          registration: string | null
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
          updated_at?: string
        }
        Relationships: []
      }
      region_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          region_id: string
          slot_duration_minutes: number | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          region_id: string
          slot_duration_minutes?: number | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          region_id?: string
          slot_duration_minutes?: number | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "region_schedules_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          phone: string | null
          responsible: string | null
          type: Database["public"]["Enums"]["region_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          responsible?: string | null
          type: Database["public"]["Enums"]["region_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          responsible?: string | null
          type?: Database["public"]["Enums"]["region_type"]
          updated_at?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          created_at: string
          date: string
          defender_id: string | null
          id: string
          magistrate_id: string | null
          prosecutor_id: string | null
          region_id: string
          schedule_id: string
          shift: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          defender_id?: string | null
          id?: string
          magistrate_id?: string | null
          prosecutor_id?: string | null
          region_id: string
          schedule_id: string
          shift: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          defender_id?: string | null
          id?: string
          magistrate_id?: string | null
          prosecutor_id?: string | null
          region_id?: string
          schedule_id?: string
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
            foreignKeyName: "schedule_assignments_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audience_status: "agendada" | "realizada" | "cancelada" | "nao_compareceu"
      region_type: "macrorregiao" | "central_custodia"
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
      region_type: ["macrorregiao", "central_custodia"],
    },
  },
} as const
