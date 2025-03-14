import { CreatePost } from "../components/CreatePost";
import { motion } from "framer-motion";

export const CreatePostPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto py-6 sm:py-8 px-3 sm:px-4"
    >
      <div className="relative">
        {/* Subtle background decorations - responsive sizes */}
        <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-40 sm:w-64 h-40 sm:h-64 bg-purple-500/5 rounded-full filter blur-3xl z-0"></div>
        <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-40 sm:w-64 h-40 sm:h-64 bg-pink-500/10 rounded-full filter blur-3xl z-0"></div>

        {/* Content with glass effect */}
        <div className="relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm shadow-lg rounded-lg sm:rounded-xl border border-purple-500/20 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

          <div className="p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Create New Post
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Share your amazing content with our community
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <CreatePost />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
