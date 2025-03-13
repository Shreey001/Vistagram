import { PostList } from "../components/PostList";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

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

      {/* Recent Posts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-8">
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
            <PostList />
          </div>
        </motion.div>
      </section>
    </div>
  );
};
