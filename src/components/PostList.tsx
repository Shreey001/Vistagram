import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export interface Post {

  id: number,
  title: string,
  content: string;
  image_url: string;
  created_at: string;
  avatar_url: string | null;
  comment_count?: number;
  like_count?: number;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_posts_with_counts");

  if (error) throw new Error(error.message);

  return data as Post[];
};

export const PostList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-t-4 border-b-4 border-purple-400 animate-spin-slower"></div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Loading your posts
            </p>
            <p className="text-gray-400 text-sm">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-xl w-full mx-auto transform hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg
              className="absolute inset-0 w-full h-full text-red-500 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-300 text-sm">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  if (data?.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 max-w-xl mx-auto transform hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">No posts yet</p>
            <p className="text-gray-400">Be the first to create a post!</p>
            <Link to="/create" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 mt-4">
              Create Post
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10"
    >
      <AnimatePresence>
        {data?.map((post) => (
          <motion.div
            key={post.id}
            variants={item}
            transition={{ duration: 0.3 }}
          >
            <PostItem post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
