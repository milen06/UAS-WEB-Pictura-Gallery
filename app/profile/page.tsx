'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  category: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push('/auth');
        return;
      }

      setUser(userData.user);

      // Ambil gambar yang diunggah sendiri
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      if (postData) setPosts(postData);

      // Ambil post_id yang dibookmark
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userData.user.id);

      const bookmarkedIds = bookmarkData?.map((b) => b.post_id) || [];

      // Ambil data gambar berdasarkan post_id yang dibookmark
      if (bookmarkedIds.length > 0) {
        const { data: bookmarkedPostData } = await supabase
          .from('posts')
          .select('*')
          .in('id', bookmarkedIds);

        if (bookmarkedPostData) setBookmarkedPosts(bookmarkedPostData);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleDelete = async (postId: string) => {
    const confirm = window.confirm("Yakin ingin menghapus gambar ini?");
    if (!confirm) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setPosts(posts.filter((p) => p.id !== postId));
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 pt-24 px-6 pb-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-pink-300 mb-2">Profil Pengguna</h2>
        <p className="text-gray-600 mb-4">Email: <span className="font-medium">{user?.email}</span></p>
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-600 font-medium"
        >
          Logout
        </button>
      </div>

      {/* Gambar yang diunggah sendiri */}
      <div className="mt-10 max-w-5xl mx-auto">
        <h3 className="text-xl font-semibold text-pink-300 mb-4">Karyamu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
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
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-red-400 hover:text-red-600 mt-2"
                >
                  🗑️ Hapus
                </button>
                <button
                onClick={() => router.push(`/upload?edit=${post.id}`)}
                className="text-xs text-blue-400 hover:text-blue-600 mt-2 mr-3"
                >
                ✏️ Edit
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gambar yang dibookmark */}
      <div className="mt-12 max-w-5xl mx-auto">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">Disimpan / Bookmark ❤️</h3>
        {bookmarkedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada gambar yang disimpan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookmarkedPosts.map((post) => (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview gambar */}
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
