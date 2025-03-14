import { CreateCommunity } from "../components/CreateCommunity";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CreateCommunityPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto py-10 px-4"
    >
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl z-0"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl z-0"></div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mb-8"
        >
          <Link
            to="/communities"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Communities
          </Link>
        </motion.div>

        {/* Content with glass effect */}
        <div className="relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Create Community
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Start a new community and connect with like-minded people
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CreateCommunity />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
