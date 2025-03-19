import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export interface Post {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  user_name: string;
  community_id?: number;
  communities?: {
    id: number;
    name: string;
  };
  comments?: {
    id: number;
    content: string;
    created_at: string;
  }[];
  votes?: number;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_posts_with_counts");

  if (error) throw new Error(error.message);

  return data as Post[];
};

export const PostList = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get cached data immediately (or undefined if not in cache)
  const cachedData = queryClient.getQueryData<Post[]>(["posts"]);

  // Use the query as normal
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Prefetch posts every 5 minutes to keep cache fresh
  useEffect(() => {
    const prefetchInterval = setInterval(() => {
      queryClient.prefetchQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
      });
      console.log("Prefetched posts data");
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(prefetchInterval);
  }, [queryClient]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Show cached data with loading overlay if we're fetching but have cached data
  if (isLoading && !cachedData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-900/30 to-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-24 h-24 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-transparent animate-spin"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-red-900/30 to-black/40 backdrop-blur-sm rounded-xl border border-red-500/30 p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white mb-2"
        >
          Error Loading Posts
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 mb-6"
        >
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  // Use cached data while fetching, or the fresh data once loaded
  const postsToDisplay = isFetching && cachedData ? cachedData : data;

  if (!postsToDisplay || postsToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-900/30 to-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white mb-2"
        >
          No Posts Found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 mb-6"
        >
          Be the first to share something with the community!
        </motion.p>
        <Link to="/create">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
          >
            Create a Post
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Refresh button */}
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isRefreshing || isFetching}
          className={`p-2 rounded-full ${
            isRefreshing || isFetching
              ? "bg-gray-700 text-gray-400"
              : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
          } transition-colors`}
          title="Refresh posts"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 ${
              isRefreshing || isFetching ? "animate-spin" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </motion.button>
      </div>

      {/* Loading overlay with animation */}
      {(isFetching || isRefreshing) && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
          <div className="bg-gray-900/80 p-4 rounded-lg flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {postsToDisplay.map((post) => (
            <motion.div key={post.id} variants={item} layout>
              <PostItem post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
