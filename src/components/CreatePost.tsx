import { ChangeEvent, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { fetchCommunities } from "./CommunityList";

interface PostInput {
  title: string;
  content: string;
  avatar_url?: string;
  community_id?: number | null;
}

interface Community {
  id: number;
  name: string;
  description: string;
}

const createPost = async (post: PostInput, ImageFile: File) => {
  const filePath = `${post.title}-${Date.now()}-${ImageFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("post images")
    .upload(filePath, ImageFile);

  if (uploadError) {
    throw new Error(uploadError.message);
  }
  const { data: publicUrlData } = supabase.storage
    .from("post images")
    .getPublicUrl(filePath);

  const { data, error } = await supabase.from("posts").insert({
    ...post,
    image_url: publicUrlData.publicUrl,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);

  const { user } = useAuth();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File }) => {
      return createPost(data.post, data.imageFile);
    },
    onSuccess: () => {
      // Clear form data
      setTitle("");
      setContent("");
      setSelectedFile(null);
    },
  });

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    let timer: number;
    if (isSuccess) {
      timer = window.setTimeout(() => {
        // The success state will be reset when the component re-renders
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) return;
    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-purple-500/20 hover:border-pink-500/30 transition-all duration-300"
    >
      <div className="space-y-2">
        <motion.label
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          htmlFor="title"
          className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
        >
          Title
        </motion.label>
        <input
          type="text"
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-white/20 bg-black/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Enter post title"
        />
      </div>
      <div>
        <label
          htmlFor="content"
          className="block mb-2 font-semibold text-gray-200"
        >
          Content
        </label>
        <textarea
          id="content"
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-white/20 bg-black/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Write your post content here..."
        />
      </div>

      <div>
        <label>Select Community</label>
        <select
          id="community"
          onChange={handleCommunityChange}
          className="w-full border border-white/20 bg-black/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="">-- Select Community --</option>
          {communities?.map((community, key) => (
            <option key={key} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="image"
          className="block mb-2 font-semibold text-gray-200"
        >
          Upload Image
        </label>
        <div className="border border-dashed border-white/30 rounded-md p-4 bg-black/20">
          <input
            type="file"
            id="image"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer file:transition-colors"
          />
          {selectedFile && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-gray-400">
                Selected: {selectedFile.name}
              </p>
              <div className="mt-2 rounded-md overflow-hidden max-w-full">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full max-h-48 object-contain mx-auto border border-white/10 rounded-md"
                  onLoad={(e) =>
                    URL.revokeObjectURL((e.target as HTMLImageElement).src)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-md cursor-pointer transition-colors w-full sm:w-auto"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>
      {isError && <p className="text-red-500">Error creating post</p>}
      {isSuccess && (
        <p className="text-green-500 font-medium mt-2 animate-fade-in">
          Post created successfully!
        </p>
      )}
    </motion.form>
  );
};
