import { CommunityList } from "../components/CommunityList";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CommunitiesPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-10"
    >
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl z-0"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl z-0"></div>

        {/* Header section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 text-center mb-12"
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Communities
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
            Join vibrant communities tailored to your interests and passions.
            Connect with like-minded people!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/community/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create Community
            </Link>
          </motion.div>
        </motion.div>

        {/* Communities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <CommunityList />
        </motion.div>
      </div>
    </motion.div>
  );
};
