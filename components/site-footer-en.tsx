import Link from 'next/link';

export function SiteFooterEN() {
  return (
    <footer className="mt-24 border-t border-pizarra-100/70 bg-pizarra-700 text-marfil">
      <div className="container-solemn py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </p>
          <p className="mt-3 text-sm text-marfil/70 max-w-sm">
            Where memories breathe forever. Digital memorials with AI portraits
            and Augmented Reality — for loved ones and pets.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <p className="uppercase tracking-widest text-xs text-dorado-300 mb-2">Explore</p>
          <Link className="block hover:text-dorado-300" href="/en#pets">Pet Memorials</Link>
          <Link className="block hover:text-dorado-300" href="/en#loved-ones">Memorials for Loved Ones</Link>
          <Link className="block hover:text-dorado-300" href="/en/blog">Blog · Grief & memory</Link>
          <Link className="block hover:text-dorado-300" href="/en/partners">Partner Program</Link>
          <Link className="block hover:text-dorado-300" href="/en/for-funeral-homes">For Funeral Homes</Link>
          <Link className="block hover:text-dorado-300" href="/en/for-veterinary-clinics">For Veterinary Clinics</Link>
          <Link className="block hover:text-dorado-300" href="/en/for-hospices">For Hospices</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="uppercase tracking-widest text-xs text-dorado-300 mb-2">Legal</p>
          <Link className="block hover:text-dorado-300" href="/en/privacy">Privacy Policy</Link>
          <Link className="block hover:text-dorado-300" href="/en/terms">Terms of Service</Link>
          <Link className="block hover:text-dorado-300" href="/en/contact">Contact</Link>
          <Link className="block hover:text-dorado-300 mt-3" href="/">
            Español →
          </Link>
        </div>
      </div>
      <div className="border-t border-marfil/10 py-6 text-center text-xs text-marfil/50">
        © {new Date().getFullYear()} Historias Infinitas · Made with care
      </div>
    </footer>
  );
}
