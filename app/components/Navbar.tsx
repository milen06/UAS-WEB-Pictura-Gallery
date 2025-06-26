'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);
    };
    fetchUser();

    const currentSearch = searchParams.get('search');
    if (currentSearch) setSearchTerm(currentSearch);
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  // Sembunyikan navbar di halaman auth
  if (pathname.startsWith("/auth")) return null;

  return (
    <header className="bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
        <h1 className="text-lg font-semibold text-pink-300">Pictura Gallery</h1>
      </div>

      <form onSubmit={handleSearch} className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Cari gambar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-pink-50 border border-pink-200 text-sm rounded-full px-4 py-1 text-pink-300 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 w-64"
        />
      </form>

      <div className="flex items-center space-x-4 ml-auto mr-6">
        <Link href="/" className="text-purple-300 hover:text-pink-300 font-medium text-sm">Beranda</Link>
        <Link href="/categories" className="text-purple-300 hover:text-pink-300 font-medium text-sm">Kategori</Link>
        {user && (
          <>
            <Link href="/upload" className="text-purple-300 hover:text-pink-300 font-medium text-sm">Upload</Link>
            <Link href="/profile" className="text-purple-300 hover:text-pink-300 font-medium text-sm">Profile</Link>
            <button onClick={handleLogout} className="text-sm text-pink-300 hover:text-purple-300 font-medium">
              Logout
            </button>
          </>
        )}
        {!user && (
          <button onClick={() => router.push("/auth")} className="text-sm text-purple-300 hover:text-pink-300 font-medium">
            Login
          </button>
        )}
      </div>
    </header>
  );
}
