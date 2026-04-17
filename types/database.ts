export type MemorialType = 'mascota' | 'ser_querido';
export type MemorialStatus = 'borrador' | 'publicado' | 'privado';
export type MediaKind = 'foto' | 'video';
export type AiStatus = 'pendiente' | 'procesando' | 'completado' | 'fallido';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memorial {
  id: string;
  owner_id: string;
  slug: string;
  type: MemorialType;
  status: MemorialStatus;
  name: string;
  birth_date: string | null;
  passing_date: string | null;
  biography: string | null;
  epitaph: string | null;
  cover_photo_url: string | null;
  portrait_ai_url: string | null;
  ar_video_url: string | null;
  ar_model_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface MemorialMedia {
  id: string;
  memorial_id: string;
  kind: MediaKind;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface AiGeneration {
  id: string;
  memorial_id: string;
  user_id: string;
  source_url: string;
  prompt: string;
  model: string;
  replicate_id: string | null;
  output_url: string | null;
  status: AiStatus;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
