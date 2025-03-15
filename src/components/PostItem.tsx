import { Link } from "react-router-dom";
import { Post } from "./PostList";
import { motion } from "framer-motion";

interface Props {
  post: Post;
  compact?: boolean;
}

// Function to strip HTML tags for preview
const stripHtmlTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const PostItem = ({ post, compact = false }: Props) => {
  if (compact) {
    return <CompactPostItem post={post} />;
  }

  // Prepare content for preview
  const contentPreview =
    post.content.includes("<") && post.content.includes(">")
      ? stripHtmlTags(post.content)
      : post.content;

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 shadow-lg rounded-lg sm:rounded-xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-pink-500/10 hover:shadow-xl h-full flex flex-col">
      <Link to={`/post/${post.id}`} className="flex flex-col h-full">
        {/* Image banner */}
        <div className="relative group overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-40 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Floating badge for community if available */}
          {post.communities && (
            <div className="absolute top-2 right-2 bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
              {post.communities.name}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-5 flex-grow flex flex-col">
          {/* Header: Title and Date */}
          <div className="mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Content preview */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 mb-3 sm:mb-4 flex-grow">
            {contentPreview}
          </p>

          {/* Author info */}
          <div className="flex items-center gap-2 sm:gap-3 mt-auto border-t border-purple-500/10 pt-3 sm:pt-4">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="Avatar"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-purple-500/50"
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {post.user_name
                  ? post.user_name.charAt(0).toUpperCase()
                  : post.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-300">
              {post.user_name || "Anonymous"}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="px-3 sm:px-5 py-2 sm:py-3 bg-black/20 border-t border-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 sm:gap-1.5 bg-pink-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-pink-400 text-xs">
                  {post.like_count || 0}
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 sm:gap-1.5 bg-purple-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-purple-400 text-xs">
                  {post.comment_count || 0}
                </span>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xs font-medium text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
            >
              Read More
            </motion.div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const CompactPostItem = ({ post }: { post: Post }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 shadow-md rounded-lg sm:rounded-xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-pink-500/10 hover:shadow-lg h-full"
    >
      <Link to={`/post/${post.id}`} className="block h-full">
        <div className="relative overflow-hidden aspect-[5/2]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Community badge */}
          {post.communities && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
              {post.communities.name}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h2 className="text-sm sm:text-base font-bold text-white line-clamp-2">
              {post.title}
            </h2>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex items-center justify-between">
          {/* Author info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="Avatar"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-purple-500/50"
              />
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                {post.user_name
                  ? post.user_name.charAt(0).toUpperCase()
                  : post.title.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs sm:text-sm text-gray-400">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Engagement metrics */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-pink-400 text-xs sm:text-sm">
                {post.like_count || 0}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-purple-400 text-xs sm:text-sm">
                {post.comment_count || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// New component for community pages
const CommunityPostItem = ({ post }: { post: Post }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 shadow-md rounded-lg sm:rounded-xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-pink-500/10 hover:shadow-lg h-full"
    >
      <Link to={`/post/${post.id}`} className="block h-full">
        <div className="relative overflow-hidden aspect-[5/3]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
              {post.title}
            </h2>
          </div>
        </div>

        <div className="p-2 sm:p-3">
          {/* Date only */}
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export { PostItem, CompactPostItem, CommunityPostItem };
