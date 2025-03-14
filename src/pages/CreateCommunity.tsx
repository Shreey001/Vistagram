import { CreateCommunity } from "../components/CreateCommunity";
import { motion } from "framer-motion";

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

        {/* Content with glass effect */}
        <div className="relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Create Community
              </h2>
              <p className="text-gray-400">
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
