import { CommunitiesList } from "../components/CommunitiesList";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { PostItem } from "../components/PostItem";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";

// Fetch posts function for homepage
const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_posts_with_counts");

  if (error) throw new Error(error.message);

  return data as Post[];
};

export const Home = () => {
  const { user, signInWithGithub } = useAuth();

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Recent Posts
              </h2>
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

            <div className="bg-gray-900/30 p-6 rounded-2xl shadow-lg border border-purple-500/20">
              <HomepagePostList />
            </div>
          </motion.div>

          {/* Sidebar - Communities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <CommunitiesList />

            {/* Additional sidebar content */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
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
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Custom PostList component for HomePage with compact post items in a grid
const HomepagePostList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {data.map((post) => (
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
  );
};
