import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "../supabase-client";
import { toast } from "react-hot-toast";

interface DeletePostModalProps {
  postId: number;
  onClose: () => void;
  onDelete: () => void;
}

export const DeletePostModal = ({
  postId,
  onClose,
  onDelete,
}: DeletePostModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");

      console.log("Attempting to delete post:", {
        postId,
        userId: user.id,
      });

      const { data, error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id)
        .select(); // Add select to see what was deleted

      console.log("Delete response:", { data, error: deleteError });

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "Post not found or you do not have permission to delete it"
        );
      }

      toast.success("Post deleted successfully");
      onDelete();
      onClose();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
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
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl border border-red-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
          Delete Post
        </h2>

        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
            disabled={isDeleting}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 ${
              isDeleting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? (
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
                Deleting...
              </div>
            ) : (
              "Delete Post"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
