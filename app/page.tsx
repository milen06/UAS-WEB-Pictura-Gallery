'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

interface Post {
  id: string;
  image_url: string;
  description: string;
  category: string;
  created_at: string;
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<Post | null>(null);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);

      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postData) setPosts(postData);

      if (userData?.user) {
        const { data: bookmarkData } = await supabase
          .from("bookmarks")
          .select("post_id")
          .eq("user_id", userData.user.id);

        if (bookmarkData) {
          setBookmarks(bookmarkData.map((b) => b.post_id));
        }
      }
    };

    fetchData();
  }, []);

  const toggleBookmark = async (postId: string) => {
    if (!user) return;

    const isBookmarked = bookmarks.includes(postId);

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);
      setBookmarks(bookmarks.filter((id) => id !== postId));
    } else {
      await supabase.from("bookmarks").insert([
        { user_id: user.id, post_id: postId },
      ]);
      setBookmarks([...bookmarks, postId]);
    }
  };

  return (
    <main className="pt-24 px-6 pb-10 min-h-screen bg-white">
      {user && (
        <div className="bg-pink-100 shadow-md rounded-xl p-6 mb-10 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-pink-300">Selamat datang (❁´◡`❁)</h2>
          <p className="text-gray-600 mt-2">{user.email}</p>
        </div>
      )}

      {!user && (
        <div className="bg-pink-50 shadow-md rounded-xl p-6 mb-10 w-full text-center border border-white">
          <h2 className="text-2xl font-bold text-pink-300">
            Selamat datang di Pictura Gallery! 🎨
          </h2>
          <p className="text-purple-300 mt-2">
            Jelajahi karya visual dari pengguna lain. Login untuk menyimpan, mengunggah, dan bookmark gambar favoritmu!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts
          .filter((post) =>
            post.description.toLowerCase().includes(searchTerm) ||
            post.category.toLowerCase().includes(searchTerm)
          )
          .map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={post.image_url}
                alt={post.description}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setSelectedImage(post)}
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-pink-400">{post.category}</p>
                <p className="text-gray-700 mt-1">{post.description}</p>
                {user && (
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`mt-3 text-sm px-3 py-1 rounded-md text-white ${
                      bookmarks.includes(post.id)
                        ? "bg-pink-400 hover:bg-pink-500"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    Simpan
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 px-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.image_url}
            alt="Preview"
            className="max-w-[90%] max-h-[70%] rounded-xl shadow-xl border-4 border-white"
          />
          <div className="mt-4 text-center text-white">
            <p className="text-sm font-semibold">{selectedImage.category}</p>
            <p className="text-base mt-1">{selectedImage.description}</p>
          </div>
          <p className="text-xs text-gray-300 mt-4">(Klik di luar gambar untuk menutup)</p>
        </div>
      )}
    </main>
  );
}
