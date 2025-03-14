import { ChangeEvent, useState } from "react";
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

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [formStep, setFormStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

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
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Share your thoughts, story, or description..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  ></textarea>
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
