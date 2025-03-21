import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "./PostList";
import { EditPost } from "./EditPost";
import { DeletePostModal } from "./DeletePostModal";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface UserPostListProps {
  posts: Post[];
  userId: string;
}

export const UserPostList = ({ posts, userId }: UserPostListProps) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handlePostUpdate = () => {
    // Invalidate and refetch posts
    queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
    setSelectedPost(null);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  if (!posts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">No posts yet</p>
        <Link
          to="/create"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          Create Your First Post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white">{post.title}</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(post)}
                className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors duration-300"
              >
                <PencilIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(post)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors duration-300"
              >
                <TrashIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <p className="text-gray-300">{post.content}</p>
          <div className="mt-4 text-sm text-gray-500">
            Posted on {new Date(post.created_at).toLocaleDateString()}
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {isEditModalOpen && selectedPost && (
          <EditPost
            post={selectedPost}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handlePostUpdate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && selectedPost && (
          <DeletePostModal
            postId={selectedPost.id}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handlePostUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
