/**
 * Auto-generated Supabase database types.
 * Re-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 *
 * Table: exam_results
 * ┌─────────────────────┬──────────────────┬──────────┐
 * │ column              │ type             │ nullable │
 * ├─────────────────────┼──────────────────┼──────────┤
 * │ id                  │ uuid (PK)        │ no       │
 * │ player_name         │ text             │ no       │
 * │ score               │ int4             │ no       │
 * │ total_questions     │ int4             │ no       │
 * │ percentage          │ int4             │ no       │
 * │ time_spent          │ int4             │ no       │
 * │ submitted_at        │ timestamptz      │ no       │
 * │ category_breakdown  │ jsonb            │ no       │
 * │ voided              │ bool             │ no       │
 * └─────────────────────┴──────────────────┴──────────┘
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      exam_results: {
        Row: {
          id: string;
          player_name: string;
          score: number;
          total_questions: number;
          percentage: number;
          time_spent: number;
          submitted_at: string;
          category_breakdown: Json;
          voided: boolean;
        };
        Insert: {
          id?: string;
          player_name: string;
          score: number;
          total_questions: number;
          percentage: number;
          time_spent: number;
          submitted_at?: string;
          category_breakdown: Json;
          voided: boolean;
        };
        Update: {
          id?: string;
          player_name?: string;
          score?: number;
          total_questions?: number;
          percentage?: number;
          time_spent?: number;
          submitted_at?: string;
          category_breakdown?: Json;
          voided?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
