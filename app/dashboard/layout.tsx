import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { LogOut, Home, PlusCircle, ShieldCheck, Handshake, UserCog } from 'lucide-react';

// Área privada — nunca indexar
export const metadata: Metadata = {
  title: 'Panel — Historias Infinitas',
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const isAdmin = isAdminEmail(user.email);

  // ¿Es socio? (partner_accounts.user_id = user.id)
  const { data: partnerAccount } = await supabase
    .from('partner_accounts')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  const isPartner = Boolean(partnerAccount);

  return (
    <div className="min-h-screen bg-marfil-100">
      <header className="border-b border-pizarra-100 bg-marfil/80 backdrop-blur sticky top-0 z-30">
        <div className="container-solemn h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-xl text-pizarra-800">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-pizarra-600">
            <Link href="/dashboard" className="hover:text-pizarra-900 flex items-center gap-1">
              <Home className="h-4 w-4" /> Mis nichos virtuales
            </Link>
            <Link href="/dashboard/new" className="hover:text-pizarra-900 flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Nuevo
            </Link>
            <Link href="/dashboard/cuenta" className="hover:text-pizarra-900 flex items-center gap-1">
              <UserCog className="h-4 w-4" /> Mi cuenta
            </Link>
            {isPartner && (
              <Link href="/dashboard/partner" className="hover:text-pizarra-900 flex items-center gap-1 text-dorado-600">
                <Handshake className="h-4 w-4" /> Panel Socio
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/admin" className="hover:text-pizarra-900 flex items-center gap-1 text-dorado-600">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-pizarra-500">
              {profile?.full_name ?? profile?.email}
            </span>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-1" /> Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-solemn py-10">{children}</main>
    </div>
  );
}
