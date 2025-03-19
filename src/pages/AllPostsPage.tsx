import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "../components/PostItem";
import { Post } from "../components/PostList";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Community } from "../components/CommunitiesList";

// Fetch all communities for filter dropdown
const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Community[];
};

// Fetch posts function
const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_posts_with_counts");

  if (error) throw new Error(error.message);

  return data as Post[];
};

// Fetch posts by community ID
const fetchPostsByCommunity = async (communityId: number): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*,communities(name)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Post[];
};

export const AllPostsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9); // Show 9 posts per page (3 rows of 3)
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(
    null
  );

  // Reset page when community filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCommunity]);

  // Fetch all communities for the filter dropdown
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  // Fetch posts based on selected community
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", selectedCommunity],
    queryFn: () =>
      selectedCommunity
        ? fetchPostsByCommunity(selectedCommunity)
        : fetchPosts(),
  });

  // Get current posts for pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = data?.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate total pages
  const totalPages = data ? Math.ceil(data.length / postsPerPage) : 0;

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (isLoading || communitiesLoading)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                All Posts
              </h1>
              <Link
                to="/create"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <span>Create Post</span>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            </div>

            {/* Community Filter - Loading State */}
            <div className="flex flex-col gap-2">
              <div className="animate-pulse bg-gray-700 h-10 rounded-lg w-full max-w-xs mt-2"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

  if (error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                All Posts
              </h1>
              <Link
                to="/create"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <span>Create Post</span>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            </div>

            {/* Community Filter */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    !selectedCommunity
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"
                  }`}
                >
                  All Communities
                </button>

                {communitiesLoading ? (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-700 h-9 w-28 rounded-full"
                        style={{ animationDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  communities?.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedCommunity === community.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                          : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"
                      }`}
                    >
                      {community.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-900/30 rounded-xl border border-red-500/30 p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Error loading posts
            </h3>
            <p className="text-gray-300 mb-4">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <button
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                All Posts
              </h1>
              <Link
                to="/create"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <span>Create Post</span>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            </div>

            {/* Community Filter */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    !selectedCommunity
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"
                  }`}
                >
                  All Communities
                </button>

                {communitiesLoading ? (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-700 h-9 w-28 rounded-full"
                        style={{ animationDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  communities?.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedCommunity === community.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                          : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"
                      }`}
                    >
                      {community.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-900/30 rounded-xl border border-purple-500/20 p-8">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-300 mb-6">
              Be the first to share something amazing with our community!
            </p>
            <Link
              to="/create"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Create Post
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              All Posts
            </h1>
            <Link
              to="/create"
              className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              <span>Create Post</span>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>

          {/* Community Filter */}
          <div className="flex items-center gap-4">
            <div className="w-full max-w-xs">
              {communitiesLoading ? (
                <div className="animate-pulse bg-gray-700 h-10 rounded-lg w-full"></div>
              ) : (
                <select
                  value={selectedCommunity || ""}
                  onChange={(e) =>
                    setSelectedCommunity(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                >
                  <option value="">All Communities</option>
                  {communities?.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedCommunity && (
              <button
                onClick={() => setSelectedCommunity(null)}
                className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
              >
                <span>Clear Filter</span>
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
            )}
          </div>
        </div>

        <div className="bg-gray-900/30 p-6 rounded-2xl shadow-lg border border-purple-500/20">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentPosts?.map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <PostItem post={post} compact={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
