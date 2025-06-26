"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingPostId = searchParams.get("edit");

  // Ambil user & data gambar jika edit
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/auth");
        return;
      }
      setUser(userData.user);

      if (editingPostId) {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", editingPostId)
          .single();

        if (error || !data) {
          alert("Gagal ambil data gambar untuk edit");
          return;
        }

        setDescription(data.description);
        setCategory(data.category);
        setExistingImageUrl(data.image_url);
      }
    };

    fetchData();
  }, [editingPostId]);

  const handleUpload = async () => {
    if (!description.trim() || !category.trim()) {
      alert("Semua field wajib diisi!");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId || userError) {
      alert("User belum login atau gagal ambil data user");
      console.error("User error:", userError);
      return;
    }

    let imageUrl = existingImageUrl;

    // Jika user upload file baru
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images") // ganti sesuai nama bucket
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Upload gagal: " + uploadError.message);
        console.error("Storage Upload Error:", uploadError);
        return;
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;
    }

    // Proses INSERT atau UPDATE ke tabel `posts`
    if (editingPostId) {
      const { error: updateError } = await supabase
        .from("posts")
        .update({ description, category, image_url: imageUrl })
        .eq("id", editingPostId)
        .eq("user_id", userId); // pastikan hanya update milik sendiri

      if (updateError) {
        alert("Update gagal: " + updateError.message);
        console.error("Update Error:", updateError);
        return;
      }

      alert("Update berhasil!");
    } else {
      const { error: dbError } = await supabase.from("posts").insert([
        {
          user_id: userId, // penting agar RLS lolos
          image_url: imageUrl,
          description,
          category,
        },
      ]);

      if (dbError) {
        alert("Gagal simpan ke database: " + dbError.message);
        console.error("Insert Error:", dbError);
        return;
      }

      alert("Upload berhasil!");
    }

    router.push("/profile");
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center pt-20 px-4">
      <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-pink-300">
          {editingPostId ? "Edit Gambar ✏️" : "Upload Gambar 🎨"}
        </h1>

        {editingPostId && existingImageUrl && (
          <img
            src={existingImageUrl}
            alt="Gambar lama"
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="mb-4 block text-purple-300"
        />

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 mb-4 text-sm text-purple-300"
        />

        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded p-2 mb-4 text-sm text-purple-300"
        />

        <button
          onClick={handleUpload}
          className="bg-pink-300 hover:bg-purple-300 text-white py-2 px-4 rounded w-full"
        >
          {editingPostId ? "Update" : "Upload"}
        </button>
      </div>
    </main>
  );
}
