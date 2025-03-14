import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
  post_count?: number;
}

const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);

  return data || [];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const CommunitiesList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Communities</h2>
          <div className="h-4 w-20 bg-purple-500/20 animate-pulse rounded-full"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-white/5 rounded-lg mb-2 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-400 mb-2">Communities</h2>
        <p className="text-sm text-gray-400">Unable to load communities</p>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Communities</h2>
        <div className="text-center py-6">
          <p className="text-gray-400 mb-3">No communities yet</p>
          <Link
            to="/community/create"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Create First Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Communities</h2>
        <Link
          to="/communities"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </Link>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        <AnimatePresence>
          {data?.map((community) => (
            <motion.div
              key={community.id}
              variants={item}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <Link
                to={`/community/${community.id}`}
                className="block bg-white/5 group-hover:bg-white/10 rounded-lg p-3 transition-all duration-300 border border-transparent group-hover:border-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        {community.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <Link
          to="/community/create"
          className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
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
          Create New Community
        </Link>
      </div>
    </div>
  );
};
