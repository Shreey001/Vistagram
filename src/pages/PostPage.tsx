import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostItem } from "../components/PostItem";

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading,
    error,
  } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
    enabled: !!postId,
  });

  // Fetch related posts
  const { data: relatedPosts } = useQuery<Post[], Error>({
    queryKey: ["relatedPosts", post?.community_id, postId],
    queryFn: () => fetchRelatedPosts(post?.community_id, postId),
    enabled: !!post?.community_id,
  });

  if (isLoading) return <PostLoadingSkeleton />;
  if (error || !post) return <PostErrorState error={error} />;

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this post: ${post.title}`;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      default:
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    }
    setShowShareOptions(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Banner Image with Title */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl transition-opacity duration-500 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          } flex items-center justify-center z-10`}
        >
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <img
          src={post.image_url}
          alt={post.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            imageLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/60 to-gray-950"></div>

        {/* Navigation Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <Link
            to="/"
            className="p-2 bg-gray-900/80 backdrop-blur-md rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
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
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="p-2 bg-gray-900/80 backdrop-blur-md rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => shareOnSocial("twitter")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => shareOnSocial("facebook")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                    <button
                      onClick={() => shareOnSocial("linkedin")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post Title and Community in Banner */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            {post.community_name && (
              <Link
                to={`/community/${post.community_id}`}
                className="inline-block mb-4 px-4 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors"
              >
                {post.community_name}
              </Link>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-400 text-sm">
              <span>{formatDate(post.created_at)}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <LikeButton postId={postId} minimal={true} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden"
        >
          {/* Post Content */}
          <div className="p-6 md:p-10">
            <div className="prose prose-lg prose-invert prose-headings:text-pink-400 prose-a:text-purple-400 prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300 max-w-none">
              {/* Check if content contains HTML tags */}
              {post.content.includes("<") && post.content.includes(">") ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap first-letter:text-4xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-pink-500">
                  {post.content}
                </p>
              )}
            </div>
          </div>

          {/* Reddit-style Comment Section */}
          <div className="border-t border-gray-800 bg-gray-950">
            <div className="p-6 md:p-10">
              <CommentSection postId={postId} redditStyle={true} />
            </div>
          </div>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              More from this community
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence>
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    <PostItem post={relatedPost} compact={true} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Helper components
const PostLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-950 pt-16">
    <div className="w-full h-[50vh] bg-gray-900 animate-pulse"></div>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8 bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 p-6 md:p-10">
        <div className="space-y-4">
          <div className="h-4 bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const PostErrorState = ({ error }: { error: Error | null }) => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-xl w-full mx-auto transform hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <svg
          className="absolute inset-0 w-full h-full text-red-500 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-300 text-sm">
          {error?.message || "Failed to load post"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, communities(id, name)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Transform the data to match the Post interface
  return {
    ...data,
    community_id: data.communities?.id,
    community_name: data.communities?.name,
  } as Post;
};

const fetchRelatedPosts = async (
  communityId?: number,
  currentPostId?: number
): Promise<Post[]> => {
  if (!communityId) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("community_id", communityId)
    .neq("id", currentPostId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    throw new Error(error.message);
  }

  return data as Post[];
};
