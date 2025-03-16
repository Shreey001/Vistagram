import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";
import { Comment as BaseComment } from "../components/CommentSection";
import { PostItem } from "../components/PostItem";

// Extend the Comment interface to include the posts property
interface Comment extends BaseComment {
  posts?: {
    id: number;
    title: string;
    image_url: string;
  };
}

// Fetch user's posts
const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  if (!userId) return [];

  try {
    console.log("Fetching posts for user ID:", userId);

    // First try to get posts by user_id (most reliable method)
    const { data: userIdData, error: userIdError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // If we found posts with user_id, process them
    if (!userIdError && userIdData && userIdData.length > 0) {
      console.log(`Found ${userIdData.length} posts for user ID: ${userId}`);

      // For each post, fetch its community if it has one
      const postsWithCommunities = await Promise.all(
        userIdData.map(async (post) => {
          if (post.community_id) {
            const { data: communityData, error: communityError } =
              await supabase
                .from("communities")
                .select("id, name")
                .eq("id", post.community_id)
                .single();

            if (!communityError && communityData) {
              return {
                ...post,
                communities: communityData,
              };
            }
          }
          return post;
        })
      );

      return postsWithCommunities;
    }

    // If no posts found with user_id, try to get the user's name
    console.log("No posts found with user_id, trying with user_name");

    // Skip the users table query if it's likely to fail (table might not exist yet)
    // Go directly to using session data
    console.log("Trying to get user info from session data");

    // Get the current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (!sessionError && sessionData?.session?.user) {
      const authUser = sessionData.session.user;
      const userName =
        authUser?.user_metadata?.user_name ||
        authUser?.email?.split("@")[0] ||
        "Anonymous User";

      console.log(`Using user_name from session: ${userName}`);

      // Try to get posts by user_name
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_name", userName)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        console.log(`Found ${data.length} posts for user: ${userName}`);

        // For each post, fetch its community if it has one
        const postsWithCommunities = await Promise.all(
          data.map(async (post) => {
            if (post.community_id) {
              const { data: communityData, error: communityError } =
                await supabase
                  .from("communities")
                  .select("id, name")
                  .eq("id", post.community_id)
                  .single();

              if (!communityError && communityData) {
                return {
                  ...post,
                  communities: communityData,
                };
              }
            }
            return post;
          })
        );

        return postsWithCommunities;
      }
    }

    console.log("No posts found for user");
    return [];
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
};

// Fetch user's comments
const fetchUserComments = async (userId: string): Promise<Comment[]> => {
  if (!userId) return [];

  try {
    console.log("Fetching comments for user ID:", userId);

    // First try to get comments by user_id (most reliable method)
    const { data: userIdData, error: userIdError } = await supabase
      .from("comments")
      .select("*, posts(id, title, image_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // If we found comments with user_id, return them
    if (!userIdError && userIdData && userIdData.length > 0) {
      console.log(`Found ${userIdData.length} comments for user ID: ${userId}`);
      return userIdData;
    }

    // If no comments found with user_id, try to get the user's name
    console.log("No comments found with user_id, trying with author");

    // Skip the users table query if it's likely to fail (table might not exist yet)
    // Go directly to using session data
    console.log("Trying to get user info from session data");

    // Get the current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (!sessionError && sessionData?.session?.user) {
      const authUser = sessionData.session.user;
      const userName =
        authUser?.user_metadata?.user_name ||
        authUser?.email?.split("@")[0] ||
        "Anonymous User";

      console.log(`Using user_name from session: ${userName}`);

      // Try to get comments by author
      const { data, error } = await supabase
        .from("comments")
        .select("*, posts(id, title, image_url)")
        .eq("author", userName)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        console.log(`Found ${data.length} comments for user: ${userName}`);
        return data;
      }
    }

    console.log("No comments found for user");
    return [];
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return [];
  }
};

// Fetch user's liked posts
const fetchUserLikes = async (userId: string): Promise<Post[]> => {
  if (!userId) return [];

  try {
    // First get the post IDs that the user has liked
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("post_id")
      .eq("user_id", userId)
      .eq("vote", 1);

    if (votesError) throw new Error(votesError.message);

    if (!votes || votes.length === 0) return [];

    // Then fetch the posts with those IDs
    const postIds = votes.map((vote) => vote.post_id);

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .in("id", postIds)
      .order("created_at", { ascending: false });

    if (postsError) throw new Error(postsError.message);

    if (!posts || posts.length === 0) return [];

    // For each post, fetch its community if it has one
    const postsWithCommunities = await Promise.all(
      posts.map(async (post) => {
        if (post.community_id) {
          const { data: communityData, error: communityError } = await supabase
            .from("communities")
            .select("id, name")
            .eq("id", post.community_id)
            .single();

          if (!communityError && communityData) {
            return {
              ...post,
              communities: communityData,
            };
          }
        }
        return post;
      })
    );

    return postsWithCommunities;
  } catch (error) {
    console.error("Error fetching user likes:", error);
    return [];
  }
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "likes">(
    "posts"
  );

  // Always fetch data regardless of whether user is logged in or not
  // This ensures hooks are always called in the same order
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn: () => fetchUserPosts(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: userComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["userComments", user?.id],
    queryFn: () => fetchUserComments(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: userLikes = [], isLoading: likesLoading } = useQuery({
    queryKey: ["userLikes", user?.id],
    queryFn: () => fetchUserLikes(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Get user display name and initials - moved outside the conditional
  const displayName = user
    ? user.user_metadata?.user_name || user.email?.split("@")[0] || user.email
    : "";

  const getInitials = () => {
    if (!displayName) return "?";
    return displayName.charAt(0).toUpperCase();
  };

  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-xl border border-purple-500/20 shadow-xl max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">Not Logged In</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to view your profile.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative">
            <div className="absolute -bottom-16 left-8 flex items-end">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-gray-900"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-900">
                  {getInitials()}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-6 px-8">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-gray-400">{user.email}</p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-400">Joined</p>
                <p className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-400">Posts</p>
                <p className="text-white font-medium">
                  {userPosts?.length || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-400">Comments</p>
                <p className="text-white font-medium">
                  {userComments?.length || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-400">Likes</p>
                <p className="text-white font-medium">
                  {userLikes?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "posts"
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "comments"
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "likes"
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Likes
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="mt-8">
          {activeTab === "posts" && (
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-8">
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userPosts && userPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostItem post={post} compact={true} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven't created any posts yet. Start sharing with the
                    community!
                  </p>
                  <Link to="/create">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg"
                    >
                      Create a Post
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-8">
              {commentsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userComments && userComments.length > 0 ? (
                <div className="space-y-4">
                  {userComments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/80 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {user.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                              {getInitials()}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-white font-medium">
                                {displayName}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-3">
                            {comment.content}
                          </p>
                          {comment.posts && (
                            <Link
                              to={`/post/${comment.posts.id}`}
                              className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg hover:bg-gray-900/80 transition-colors"
                            >
                              <img
                                src={comment.posts.image_url}
                                alt={comment.posts.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="text-sm text-gray-300 line-clamp-1">
                                {comment.posts.title}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No comments yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven't made any comments yet. Join the conversation!
                  </p>
                  <Link to="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg"
                    >
                      Browse Posts
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-8">
              {likesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userLikes && userLikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userLikes.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostItem post={post} compact={true} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No likes yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven't liked any posts yet. Explore and find content
                    you enjoy!
                  </p>
                  <Link to="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg"
                    >
                      Discover Posts
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
