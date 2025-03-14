import { useQuery } from "@tanstack/react-query";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { CommunityPostItem } from "./PostItem";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface Props {
  communityId: number;
}

// Fetch community details
const fetchCommunityDetails = async (communityId: number) => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Fetch community posts
export const fetchCommunityPost = async (
  communityId: number
): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*,communities(name)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Post[];
};

export const CommunityDisplay = ({ communityId }: Props) => {
  // Fetch community details
  const {
    data: communityDetails,
    error: communityError,
    isLoading: communityLoading,
  } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => fetchCommunityDetails(Number(communityId)),
  });

  // Fetch community posts
  const {
    data: posts,
    error: postsError,
    isLoading: postsLoading,
  } = useQuery<Post[], Error>({
    queryKey: ["communityPosts", communityId],
    queryFn: () => fetchCommunityPost(Number(communityId)),
  });

  const isLoading = communityLoading || postsLoading;
  const error = communityError || postsError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading header */}
          <div className="animate-pulse mb-10">
            <div className="h-12 bg-purple-500/20 rounded-lg w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700/50 rounded-lg w-1/2 mx-auto"></div>
          </div>

          {/* Loading posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800/30 rounded-xl h-72 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-400"
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
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Community Not Found
          </h2>
          <p className="text-gray-300 mb-6">
            {error instanceof Error
              ? error.message
              : "The community you're looking for doesn't exist or was removed."}
          </p>
          <Link
            to="/communities"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
          >
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        {/* Community Header Section - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="relative py-12 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/50 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/50 rounded-full filter blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50 border-2 border-white/20">
                <span className="text-3xl font-bold text-white">
                  {communityDetails?.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {communityDetails?.name}
              </h1>

              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {communityDetails?.description || "Welcome to our community!"}
              </p>
            </div>
          </div>

          {/* Stats and Actions - Simplified */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex flex-col items-center bg-white/5 px-6 py-3 rounded-xl border border-purple-500/20">
              <span className="text-2xl font-bold text-white mb-1">
                {posts?.length || 0}
              </span>
              <span className="text-gray-400 text-sm">Posts</span>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Post
            </Link>
          </div>
        </motion.div>

        {/* Posts Section - Using CommunityPostItem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {posts && posts.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-white mb-6 text-center">
                Recent Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommunityPostItem post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-purple-500/20 p-10 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                No Posts Yet
              </h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Be the first to share content in the {communityDetails?.name}{" "}
                community!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Post
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
