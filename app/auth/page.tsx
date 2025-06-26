'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async () => {
    setError("");

    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) return setError(error.message);

    // Semua user langsung ke halaman utama
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-200 shadow-lg rounded-xl p-8">

        {/* Bagian Logo */}
        <div className="flex justify-center mb-1">
          <img src="/logo.png" alt="Logo" className="h-30 object-contain" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-pink-300">
            {isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Selamat datang kembali!" : "Yuk mulai jadi kreator!"}
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
        />

        {error && <p className="text-pink-300 text-sm mb-4">{error}</p>}

        <button
          onClick={handleAuth}
          className="w-full bg-pink-300 text-white py-3 rounded-lg hover:bg-purple-300 transition font-semibold"
        >
          {isLogin ? "Login" : "Daftar"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Belum punya akun?{" "}
              <button className="text-purple-300 hover:underline" onClick={() => setIsLogin(false)}>
                Daftar di sini
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button className="text-purple-300 hover:underline" onClick={() => setIsLogin(true)}>
                Login di sini
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
