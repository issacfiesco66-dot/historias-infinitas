import { createClient } from '@supabase/supabase-js';

/**
 * Cliente admin (service_role). Solo usar en API routes / server actions.
 * NUNCA exponer al cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
