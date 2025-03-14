import { ChangeEvent, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { fetchCommunities } from "./CommunityList";

// TipTap Editor Imports
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

interface PostInput {
  title: string;
  content: string;
  avatar_url?: string;
  community_id?: number | null;
  image_url?: string;
}

// Create a post with an image URL - this avoids storage issues
const createPost = async (post: PostInput) => {
  try {
    // Insert the post with the provided image URL
    const { data, error } = await supabase.from("posts").insert(post);

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
};

// Menu bar component for the text editor
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 py-2 px-2 border-b border-purple-500/30 mb-3 bg-gray-800/20 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("bold")
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
          <path d="M6 20.25a.75.75 0 01-.75-.75V10.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v9a.75.75 0 01-.75.75H6z" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("italic")
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Italic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M15 4.5c-1.215 0-2.342.53-3.11 1.454a.75.75 0 01-1.08.144L8.03 4.57a1.72 1.72 0 00-2.42.32A1.72 1.72 0 005.3 7.31l3.78 3.78a.75.75 0 01.144 1.08C8.53 13.16 8 14.287 8 15.5c0 .545.123 1.06.346 1.525a.75.75 0 01-.383.976l-3.335 1.462a.75.75 0 01-.985-.434A13.19 13.19 0 013 15.5c0-3.727 1.541-7.1 4.024-9.517C9.554 3.501 12.186 2 15 2h2.25a.75.75 0 010 1.5H15z" />
          <path d="M20.753 15.31a.75.75 0 01.144-1.08A6.1 6.1 0 0022 10.5c0-.546-.124-1.064-.35-1.527a.75.75 0 01.383-.976l3.336-1.462a.75.75 0 01.985.435c.21.532.331 1.102.331 1.688 0 3.726-1.54 7.1-4.024 9.516C20.145 20.656 17.515 22.157 14.7 22.157h-2.25a.75.75 0 010-1.5h2.25c1.215 0 2.342-.53 3.11-1.454a.75.75 0 01.943-.107z" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("underline")
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M6.25 6.375a4.125 4.125 0 118.25 0v6a4.125 4.125 0 01-8.25 0v-6zM3.25 19.125a.75.75 0 01.75-.75h16a.75.75 0 010 1.5h-16a.75.75 0 01-.75-.75z" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Heading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("bulletList")
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Bullet List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
          />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("orderedList")
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Numbered List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M8.25 6.75a.75.75 0 01.75-.75h11.25a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h11.25a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h11.25a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM2.5 6.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.25a.75.75 0 01-.75-.75V6.75zm.75 3a.75.75 0 00-.75.75v.01a.75.75 0 00.75.75H3.25a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H3.25zm-.75 3.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.25a.75.75 0 01-.75-.75v-.01zm.75 3a.75.75 0 00-.75.75v.01a.75.75 0 00.75.75H3.25a.75.75 0 00.75-.75V18a.75.75 0 00-.75-.75H3.25z"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive({ textAlign: "left" })
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Align Left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
          />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive({ textAlign: "center" })
            ? "bg-purple-500/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
        }`}
        title="Align Center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6zm2.25 5.25a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zm3 5.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
          />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors ml-auto"
        title="Undo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
          />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
        title="Redo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M14.47 2.47a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.72-4.72H9a5.25 5.25 0 100 10.5h3a.75.75 0 010 1.5H9a6.75 6.75 0 010-13.5h10.19l-4.72-4.72a.75.75 0 010-1.06z"
          />
        </svg>
      </button>
    </div>
  );
};

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [formStep, setFormStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Share your thoughts, story, or description...",
      }),
      Image,
      Color,
      Highlight,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Update editor content when content state changes from outside
  useEffect(() => {
    if (editor && content === "") {
      editor.commands.setContent("");
    }
  }, [editor, content]);

  // Fetch communities for dropdown
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  // Post creation mutation
  const createPostMutation = useMutation({
    mutationFn: () => {
      setErrorMessage(null);

      if (!previewUrl) {
        throw new Error("Please select an image");
      }

      // Use the actual uploaded image from previewUrl
      const post: PostInput = {
        title,
        content,
        community_id: communityId,
        image_url: previewUrl, // Use the actual uploaded image
      };

      if (user?.user_metadata?.avatar_url) {
        post.avatar_url = user.user_metadata.avatar_url;
      }

      return createPost(post);
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setPreviewUrl(null);
      setCommunityId(null);
      setErrorMessage(null);
      // Go to success step
      setFormStep(3);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create post due to an unknown error"
      );
    },
  });

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Check file size (max 5MB for base64)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size exceeds 5MB limit");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage(null);
    }
  };

  // Handle community selection
  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  // Handle the first form submission - just moves to step 2
  const handleFirstFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(2);
  };

  // Handle the second form submission - creates the post
  const handleSecondFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate();
  };

  // Disable next button if required fields aren't filled
  const isNextDisabled = () => {
    return !title || !content || !previewUrl;
  };

  return (
    <div className="w-full">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {formStep === 3 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Post Created Successfully!
          </h3>
          <p className="text-gray-300 mb-8">
            Your post has been published and is now visible to the community.
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormStep(1);
                window.scrollTo(0, 0);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
            >
              Create Another Post
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="px-6 py-3 bg-white/10 rounded-lg text-white font-medium"
            >
              Back to Home
            </motion.a>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Progress indicator */}
          <div className="flex mb-8 w-full max-w-xs mx-auto">
            <div
              className={`w-full h-1 rounded-l-full ${
                formStep >= 1 ? "bg-purple-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`w-full h-1 rounded-r-full ${
                formStep >= 2 ? "bg-pink-500" : "bg-gray-700"
              }`}
            ></div>
          </div>

          {/* STEP 1: Post Content Form */}
          {formStep === 1 && (
            <form onSubmit={handleFirstFormSubmit} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Post Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter an eye-catching title"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Post Content
                  </label>
                  <div className="rounded-lg overflow-hidden border border-purple-500/30 bg-gray-800/50 text-white focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-transparent transition-all">
                    <MenuBar editor={editor} />
                    <EditorContent
                      editor={editor}
                      className="px-4 py-3 min-h-[150px] prose prose-invert prose-sm max-w-none focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Post Image
                  </label>
                  <div className="relative">
                    {previewUrl ? (
                      <div className="relative mb-3 overflow-hidden rounded-lg aspect-video">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-500/30 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-10 h-10 text-gray-400 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, or GIF (Max 5MB)
                          </p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isNextDisabled()}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                      isNextDisabled()
                        ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    }`}
                  >
                    Next
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </form>
          )}

          {/* STEP 2: Community Selection and Publishing Form */}
          {formStep === 2 && (
            <form onSubmit={handleSecondFormSubmit} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="community"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Select Community (optional)
                  </label>
                  {communitiesLoading ? (
                    <div className="animate-pulse bg-gray-700 h-12 rounded-lg"></div>
                  ) : (
                    <select
                      id="community"
                      value={communityId || ""}
                      onChange={handleCommunityChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    >
                      <option value="">No community</option>
                      {communities?.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Posting in a community helps more people discover your
                    content
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Post Preview
                  </h3>
                  <div className="rounded-lg overflow-hidden mb-4">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                  <p className="text-gray-300 text-sm">{content}</p>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="px-6 py-3 bg-gray-700/50 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={createPostMutation.isPending}
                    className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center gap-2 ${
                      createPostMutation.isPending
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        Publish Post
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
