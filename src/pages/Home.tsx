import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { PostItem } from "../components/PostItem";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";
import { useState, useEffect } from "react";
import { Community } from "../components/CommunitiesList";

// Fetch posts function for homepage
const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_posts_with_counts");

  if (error) throw new Error(error.message);

  return data as Post[];
};

export const Home = () => {
  const { user, signInWithGithub } = useAuth();
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(
    null
  );

  // Fetch all communities for the filter
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["home-communities"],
    queryFn: fetchCommunities,
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden mb-16 min-h-[85vh] flex items-center"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-0"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block mb-6 px-4 py-1 bg-purple-500/10 rounded-full border border-purple-500/20"
              >
                <span className="text-purple-400 font-medium">
                  Visual Stories Platform
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-8 font-mono">
                <span className="block text-white mb-2">Share Your</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Visual Stories
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                Create, share, and discover stunning visual stories. Join our
                creative community where every image tells a unique story.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                >
                  {user ? (
                    <Link to="/create">Start Creating</Link>
                  ) : (
                    <span onClick={signInWithGithub}>Join Now</span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 text-white font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <Link to="/about">Explore More</Link>
                </motion.button>
              </div>
            </motion.div>

            {/* Image Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg"
                      alt="Fantasy Castle"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="aspect-[4/5] rounded-lg overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg"
                      alt="Mystical Art"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4 pt-8"
                >
                  <div className="aspect-[4/5] rounded-lg overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/1738434/pexels-photo-1738434.jpeg"
                      alt="Night Scene"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg"
                      alt="Abstract Art"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-10">
          {/* Main Content - Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Recent Posts
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    to="/posts"
                    className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white rounded-full border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300"
                  >
                    <span>View All</span>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                  <Link
                    to="/create"
                    className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white rounded-full border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300"
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
              </div>

              {/* Community Filter - Redesigned */}
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

            <div className="bg-gray-900/30 p-6 rounded-2xl shadow-lg border border-purple-500/20">
              <HomepagePostList selectedCommunity={selectedCommunity} />
            </div>
          </motion.div>

          {/* Communities Section - Moved from sidebar to below posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Communities
              </h2>
              <Link
                to="/communities"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white rounded-full border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 text-sm"
              >
                <span>View All</span>
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Horizontal Communities Display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {communitiesLoading
                ? // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-800/50 rounded-lg p-4 animate-pulse flex flex-col items-center"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded-full mb-3"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                    </div>
                  ))
                : communities?.slice(0, 10).map((community) => (
                    <Link
                      key={community.id}
                      to={`/community/${community.id}`}
                      className="bg-gray-800/50 hover:bg-gray-800/80 rounded-lg p-4 flex flex-col items-center transition-all duration-300 border border-transparent hover:border-purple-500/30 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center mb-3 group-hover:from-purple-500/50 group-hover:to-pink-500/50 transition-all duration-300">
                        <span className="text-xl font-bold text-white">
                          {community.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors text-center mb-1">
                        {community.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate max-w-[180px] text-center">
                        {community.description || "No description"}
                      </p>
                    </Link>
                  ))}

              {/* Create Community Button */}
              <Link
                to="/community/create"
                className="bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 border border-dashed border-purple-500/30 hover:border-purple-500/50 min-h-[160px]"
              >
                <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-purple-400">
                  Create Community
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Join Vistagram Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 max-w-lg mx-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Join Vistagram
            </h2>
            <p className="text-gray-300 mb-4">
              Create an account to post your own visual stories and join
              communities.
            </p>
            {!user && (
              <button
                onClick={signInWithGithub}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
              >
                Sign Up Now
              </button>
            )}
            {user && (
              <Link
                to="/create"
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
              >
                Create Post
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Fetch all communities for filter dropdown
const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Community[];
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

// Custom PostList component for HomePage with compact post items in a grid
const HomepagePostList = ({
  selectedCommunity,
}: {
  selectedCommunity: number | null;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6); // Show 6 posts per page (3 rows of 2)

  // Reset page when community filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCommunity]);

  // Fetch posts based on selected community
  const { data, isLoading, error } = useQuery({
    queryKey: ["home-posts", selectedCommunity],
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

  if (isLoading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/30 rounded-xl h-72 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
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
    );

  if (!data || data.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
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
        <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
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
    );

  return (
    <div className="space-y-8">
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
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
  );
};
