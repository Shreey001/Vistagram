import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Community[];
};

export const CommunityList = () => {
  const { data, error, isLoading } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  // Function to generate a consistent avatar color based on community name
  const getAvatarGradient = (name: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-green-500 to-teal-500",
      "from-yellow-500 to-orange-500",
      "from-red-500 to-pink-500",
      "from-indigo-500 to-purple-500",
    ];

    // Use the sum of character codes to determine the color
    const sum = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Function to get community name initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm animate-pulse">
            Loading communities...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          No communities yet
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Be the first to create a community and start connecting with others!
        </p>
        <Link
          to="/community/create"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create First Community
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <Link to={`/community/${community.id}`} className="block p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                      community.name
                    )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {getInitials(community.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-600 transition-all duration-300">
                      {community.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(community.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {community.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-medium text-purple-400 group-hover:text-pink-400 transition-colors duration-300 inline-flex items-center gap-1">
                    View Community
                    <svg
                      className="w-3 h-3"
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
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};
