import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase-client";
import { toast } from "react-hot-toast";

interface EditPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    user_id?: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export const EditPost = ({ post, onClose, onUpdate }: EditPostProps) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when post changes
    setTitle(post.title);
    setContent(post.content);
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");

      console.log("Current user:", user.id);
      console.log("Post user_id:", post.user_id);

      if (post.user_id && post.user_id !== user.id) {
        throw new Error("You can only edit your own posts");
      }

      console.log("Updating post:", {
        id: post.id,
        newTitle: title.trim(),
        newContent: content.trim(),
        user_id: user.id,
      });

      const { data, error: updateError } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id)
        .eq("user_id", user.id)
        .select("*");

      console.log("Update response:", { data, error: updateError });

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error(
          "Post not found or you don't have permission to update it"
        );
      }

      toast.success("Post updated successfully!");
      onUpdate(); // Refresh the posts list
      onClose(); // Close the edit modal
    } catch (err: any) {
      console.error("Error updating post:", err);
      setError(err.message || "Failed to update post");
      toast.error(err.message || "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl shadow-xl border border-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Edit Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Post Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px] transition-all duration-300"
              placeholder="Write your post content"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Updating...
                </div>
              ) : (
                "Update Post"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
