'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Post {
  id: string;
  image_url: string;
  description: string;
  category: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    description: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setPosts(data || []);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen pt-24 px-6 pb-10 bg-white">
      <div className="text-center">
        <h2 className="bg-pink-100 shadow-md rounded-xl p-6 mb-10 max-w-2xl mx-auto text-center text-xl font-bold text-pink-300 mb-4">
          Pilih Kategori
        </h2>
        
        <select
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-purple-300 rounded px-4 py-2 text-purple-300"
        >
          <option value="">Semua Kategori</option>
          {[...new Set(posts.map((post) => post.category))].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {posts
            .filter((post) => {
              const matchCategory = categoryFilter ? post.category === categoryFilter : true;
              const matchSearch =
                post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.category.toLowerCase().includes(searchTerm.toLowerCase());
              return matchCategory && matchSearch;
            })
            .map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.description}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() =>
                    setSelectedImage({
                      url: post.image_url,
                      description: post.description,
                      category: post.category,
                    })
                  }
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-pink-400">{post.category}</p>
                  <p className="text-gray-700 mt-1">{post.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 px-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.url}
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
