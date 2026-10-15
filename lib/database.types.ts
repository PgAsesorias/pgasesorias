/**
 * Tipos de la base de datos.
 *
 * Escritos a mano siguiendo supabase/schema.sql + supabase/upgrades.sql, con la
 * misma forma que genera la CLI, para poder reemplazarlos cuando se ejecute:
 *
 *   npx supabase login
 *   npx supabase gen types typescript --project-id <REF> --schema public > lib/database.types.ts
 *
 * (el REF es el subdominio de NEXT_PUBLIC_SUPABASE_URL)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EstadoPublicacion = "borrador" | "publicado" | "reservado" | "vendido";
export type Transmision = "Automática" | "Manual";
export type Combustible = "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico";
export type Traccion = "4x2" | "4x4" | "AWD";
export type Condicion = "Nuevo" | "Seminuevo" | "Usado";
export type Carroceria =
  | "Sedán"
  | "Hatchback"
  | "SUV"
  | "Camioneta"
  | "Station Wagon"
  | "Coupé"
  | "Furgón"
  | "Minivan"
  | "Convertible";

type VehiculoRow = {
  id: string;
  slug: string;
  wp_id: number | null;
  titulo: string;
  marca: string;
  modelo: string;
  version: string | null;
  motor: string | null;
  anio: number;
  kilometraje: number;
  transmision: Transmision;
  combustible: Combustible;
  traccion: Traccion | null;
  puertas: number | null;
  condicion: Condicion | null;
  ubicacion: string;
  precio: number;
  precio_oferta: number | null;
  equipamiento: string[];
  seguridad: string[];
  descripcion: string | null;
  estado: EstadoPublicacion;
  destacado: boolean;
  publicado_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // upgrades.sql
  carroceria: Carroceria | null;
  color: string | null;
  cilindrada: string | null;
  duenos: number | null;
  llaves: number | null;
  revisado_pg: boolean;
  informe_path: string | null;
  informe_resumen: Json | null;
  video_url: string | null;
  vistas: number;
};

type VehiculoInsert = Omit<
  VehiculoRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "publicado_at"
  | "ubicacion"
  | "equipamiento"
  | "seguridad"
  | "estado"
  | "destacado"
  | "revisado_pg"
  | "vistas"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  publicado_at?: string | null;
  ubicacion?: string;
  equipamiento?: string[];
  seguridad?: string[];
  estado?: EstadoPublicacion;
  destacado?: boolean;
  revisado_pg?: boolean;
  vistas?: number;
};

type FotoRow = {
  id: string;
  vehiculo_id: string;
  storage_path: string;
  orden: number;
  ancho: number | null;
  alto: number | null;
  alt: string | null;
  created_at: string;
};

type ConsultaRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  mensaje: string | null;
  vehiculo_id: string | null;
  origen: string;
  atendida: boolean;
  created_at: string;
  // upgrades.sql
  datos: Json | null;
  pagina: string | null;
  utm: Json | null;
  estado: string;
};

type ReservaRow = {
  id: string;
  servicio_slug: string;
  inicio: string;
  fin: string;
  nombre: string;
  telefono: string;
  email: string | null;
  vehiculo: string | null;
  direccion: string | null;
  notas: string | null;
  estado: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; email: string; nombre: string | null; created_at: string };
        Insert: { user_id: string; email: string; nombre?: string | null; created_at?: string };
        Update: { user_id?: string; email?: string; nombre?: string | null; created_at?: string };
        Relationships: [];
      };
      opciones_equipamiento: {
        Row: { slug: string; label: string; tipo: "equipamiento" | "seguridad"; orden: number };
        Insert: { slug: string; label: string; tipo: "equipamiento" | "seguridad"; orden?: number };
        Update: { slug?: string; label?: string; tipo?: "equipamiento" | "seguridad"; orden?: number };
        Relationships: [];
      };
      vehiculos: {
        Row: VehiculoRow;
        Insert: VehiculoInsert;
        Update: Partial<VehiculoInsert>;
        Relationships: [];
      };
      vehiculo_fotos: {
        Row: FotoRow;
        Insert: Omit<FotoRow, "id" | "created_at" | "orden"> & {
          id?: string;
          created_at?: string;
          orden?: number;
        };
        Update: Partial<Omit<FotoRow, "id">> & { id?: string };
        Relationships: [
          {
            foreignKeyName: "vehiculo_fotos_vehiculo_id_fkey";
            columns: ["vehiculo_id"];
            isOneToOne: false;
            referencedRelation: "vehiculos";
            referencedColumns: ["id"];
          },
        ];
      };
      consultas: {
        Row: ConsultaRow;
        Insert: Omit<ConsultaRow, "id" | "created_at" | "atendida" | "origen" | "estado"> & {
          id?: string;
          created_at?: string;
          atendida?: boolean;
          origen?: string;
          estado?: string;
        };
        Update: Partial<ConsultaRow>;
        Relationships: [
          {
            foreignKeyName: "consultas_vehiculo_id_fkey";
            columns: ["vehiculo_id"];
            isOneToOne: false;
            referencedRelation: "vehiculos";
            referencedColumns: ["id"];
          },
        ];
      };
      config: {
        Row: { clave: string; valor: Json; descripcion: string | null; updated_at: string };
        Insert: { clave: string; valor: Json; descripcion?: string | null; updated_at?: string };
        Update: { clave?: string; valor?: Json; descripcion?: string | null; updated_at?: string };
        Relationships: [];
      };
      servicios: {
        Row: {
          slug: string;
          nombre: string;
          descripcion: string | null;
          duracion_min: number;
          activo: boolean;
          orden: number;
        };
        Insert: {
          slug: string;
          nombre: string;
          descripcion?: string | null;
          duracion_min?: number;
          activo?: boolean;
          orden?: number;
        };
        Update: {
          slug?: string;
          nombre?: string;
          descripcion?: string | null;
          duracion_min?: number;
          activo?: boolean;
          orden?: number;
        };
        Relationships: [];
      };
      reservas: {
        Row: ReservaRow;
        Insert: Omit<ReservaRow, "id" | "created_at" | "estado"> & {
          id?: string;
          created_at?: string;
          estado?: string;
        };
        Update: Partial<ReservaRow>;
        Relationships: [
          {
            foreignKeyName: "reservas_servicio_slug_fkey";
            columns: ["servicio_slug"];
            isOneToOne: false;
            referencedRelation: "servicios";
            referencedColumns: ["slug"];
          },
        ];
      };
      eventos: {
        Row: {
          id: number;
          tipo: "vista_ficha" | "clic_whatsapp" | "clic_telefono" | "simulador" | "compartir" | "favorito";
          vehiculo_id: string | null;
          pagina: string | null;
          utm: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          tipo: "vista_ficha" | "clic_whatsapp" | "clic_telefono" | "simulador" | "compartir" | "favorito";
          vehiculo_id?: string | null;
          pagina?: string | null;
          utm?: Json | null;
          created_at?: string;
        };
        Update: Partial<{
          tipo: string;
          vehiculo_id: string | null;
          pagina: string | null;
          utm: Json | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "eventos_vehiculo_id_fkey";
            columns: ["vehiculo_id"];
            isOneToOne: false;
            referencedRelation: "vehiculos";
            referencedColumns: ["id"];
          },
        ];
      };
      alertas: {
        Row: {
          id: string;
          email: string;
          filtros: Json;
          activa: boolean;
          token_baja: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          filtros: Json;
          activa?: boolean;
          token_baja?: string;
          created_at?: string;
        };
        Update: Partial<{ email: string; filtros: Json; activa: boolean }>;
        Relationships: [];
      };
    };
    Views: {
      reservas_ocupadas: {
        Row: { inicio: string; fin: string };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      estado_publicacion: EstadoPublicacion;
    };
    CompositeTypes: Record<string, never>;
  };
};

/* Alias cómodos para el resto del código. */
export type Vehiculo = VehiculoRow;
export type VehiculoNuevo = VehiculoInsert;
export type VehiculoFoto = FotoRow;
export type Consulta = ConsultaRow;
export type OpcionEquipamiento = Database["public"]["Tables"]["opciones_equipamiento"]["Row"];
