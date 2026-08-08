export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      diretores: {
        Row: {
          cargo: string;
          created_at: string;
          id: string;
          nome: string;
          ordem: number;
          updated_at: string;
        };
        Insert: {
          cargo: string;
          created_at?: string;
          id?: string;
          nome: string;
          ordem?: number;
          updated_at?: string;
        };
        Update: {
          cargo?: string;
          created_at?: string;
          id?: string;
          nome?: string;
          ordem?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      eventos: {
        Row: {
          ano: number | null;
          created_at: string;
          data_inicio: string | null;
          data_texto: string;
          id: string;
          local: string;
          modalidade: string;
          nome: string;
          updated_at: string;
        };
        Insert: {
          ano?: number | null;
          created_at?: string;
          data_inicio?: string | null;
          data_texto: string;
          id?: string;
          local: string;
          modalidade: string;
          nome: string;
          updated_at?: string;
        };
        Update: {
          ano?: number | null;
          created_at?: string;
          data_inicio?: string | null;
          data_texto?: string;
          id?: string;
          local?: string;
          modalidade?: string;
          nome?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      modalidades: {
        Row: {
          created_at: string;
          descricao: string;
          id: string;
          img_url: string | null;
          nome: string;
          ordem: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          descricao: string;
          id?: string;
          img_url?: string | null;
          nome: string;
          ordem?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          descricao?: string;
          id?: string;
          img_url?: string | null;
          nome?: string;
          ordem?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      noticias: {
        Row: {
          categoria: string;
          conteudo: string | null;
          created_at: string;
          data: string;
          id: string;
          imagem_url: string | null;
          publicado: boolean;
          resumo: string;
          slug: string;
          titulo: string;
          updated_at: string;
        };
        Insert: {
          categoria: string;
          conteudo?: string | null;
          created_at?: string;
          data?: string;
          id?: string;
          imagem_url?: string | null;
          publicado?: boolean;
          resumo: string;
          slug: string;
          titulo: string;
          updated_at?: string;
        };
        Update: {
          categoria?: string;
          conteudo?: string | null;
          created_at?: string;
          data?: string;
          id?: string;
          imagem_url?: string | null;
          publicado?: boolean;
          resumo?: string;
          slug?: string;
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          nome: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          nome?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          nome?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      mensagens: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          assunto: string;
          mensagem: string;
          lido: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          assunto: string;
          mensagem: string;
          lido?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          assunto?: string;
          mensagem?: string;
          lido?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      parceiros: {
        Row: {
          id: string;
          nome: string;
          logo_url: string | null;
          site_url: string | null;
          categoria: "apoio_institucional" | "patrocinio" | "parceria";
          ordem: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          logo_url?: string | null;
          site_url?: string | null;
          categoria: "apoio_institucional" | "patrocinio" | "parceria";
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          logo_url?: string | null;
          site_url?: string | null;
          categoria?: "apoio_institucional" | "patrocinio" | "parceria";
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clubes: {
        Row: {
          id: string;
          nome: string;
          sigla: string | null;
          logo_url: string | null;
          cidade: string | null;
          estado: string | null;
          fundacao: string | null;
          email: string | null;
          telefone: string | null;
          site_url: string | null;
          endereco: string | null;
          ativo: boolean;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          sigla?: string | null;
          logo_url?: string | null;
          cidade?: string | null;
          estado?: string | null;
          fundacao?: string | null;
          email?: string | null;
          telefone?: string | null;
          site_url?: string | null;
          endereco?: string | null;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          sigla?: string | null;
          logo_url?: string | null;
          cidade?: string | null;
          estado?: string | null;
          fundacao?: string | null;
          email?: string | null;
          telefone?: string | null;
          site_url?: string | null;
          endereco?: string | null;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      atletas: {
        Row: {
          id: string;
          data_nascimento: string;
          cpf: string | null;
          telefone: string | null;
          clube_id: string | null;
          categoria: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          data_nascimento: string;
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          categoria?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          data_nascimento?: string;
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          categoria?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      treinadores: {
        Row: {
          id: string;
          cpf: string | null;
          telefone: string | null;
          clube_id: string | null;
          credencial: string | null;
          especialidade: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          credencial?: string | null;
          especialidade?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          credencial?: string | null;
          especialidade?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gestores_clube: {
        Row: {
          id: string;
          cpf: string | null;
          telefone: string | null;
          clube_id: string | null;
          cargo: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          cargo?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cpf?: string | null;
          telefone?: string | null;
          clube_id?: string | null;
          cargo?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "editor" | "atleta" | "treinador" | "gestor_clube";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "atleta", "treinador", "gestor_clube"],
    },
  },
} as const;
