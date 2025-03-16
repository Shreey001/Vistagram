import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";
import { Comment as BaseComment } from "../components/CommentSection";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import { toast } from "react-hot-toast";

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
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(
    user?.user_metadata?.user_name || ""
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Update username in user metadata and database
      if (newUsername !== user.user_metadata?.user_name) {
        // First update the user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { user_name: newUsername },
        });

        if (updateError) throw updateError;

        // Update posts table
        const { error: postsError } = await supabase
          .from("posts")
          .update({ user_name: newUsername })
          .eq("user_id", user.id);

        if (postsError) throw postsError;

        // Update comments table
        const { error: commentsError } = await supabase
          .from("comments")
          .update({ author: newUsername })
          .eq("user_id", user.id);

        if (commentsError) throw commentsError;

        // Update users table if it exists (create if it doesn't)
        const { error: userTableError } = await supabase.from("users").upsert({
          id: user.id,
          user_name: newUsername,
          email: user.email,
          avatar_url: user.user_metadata.avatar_url,
        });

        if (userTableError && userTableError.code !== "42P01") {
          // Ignore if table doesn't exist
          throw userTableError;
        }
      }

      // Update password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error("New passwords don't match");
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) throw passwordError;
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);

      // Refresh the page after successful update to reflect changes
      if (newUsername !== user.user_metadata?.user_name) {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
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
    <div className="container mx-auto px-4 py-8">
      {!user ? (
        <div className="text-center text-gray-300">
          You need to be logged in to view your profile.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Cover Photo */}
          <div className="relative w-full h-[350px] rounded-xl overflow-hidden mb-4">
            {user.user_metadata?.cover_url ? (
              <img
                src={user.user_metadata.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "30px 30px",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                </div>
              </>
            )}
            <button className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Edit Cover Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Profile Info and Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-6 sticky top-24">
                <div className="flex flex-col items-center">
                  <div className="relative -mt-24">
                    <ProfilePictureUpload />
                  </div>
                  <div className="text-center mt-6">
                    <h1 className="text-2xl font-bold text-white">
                      {user.user_metadata?.user_name ||
                        user.email?.split("@")[0] ||
                        "Anonymous User"}
                    </h1>
                    <p className="text-gray-400 mt-1">{user.email}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 w-full mt-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {userPosts?.length || 0}
                      </p>
                      <p className="text-sm text-gray-400">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {userComments?.length || 0}
                      </p>
                      <p className="text-sm text-gray-400">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {userLikes?.length || 0}
                      </p>
                      <p className="text-sm text-gray-400">Likes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  {/* Username Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">
                        Username
                      </h3>
                      <button
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg transition-colors text-sm"
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="Enter new username"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleUpdateProfile}
                            disabled={
                              isLoading ||
                              newUsername === user.user_metadata?.user_name
                            }
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save Username</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300">
                        {user.user_metadata?.user_name || "Not set"}
                      </p>
                    )}
                  </div>

                  {/* Password Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">
                        Password
                      </h3>
                      <button
                        onClick={() => {
                          if (!isEditing) {
                            setNewPassword("");
                            setConfirmPassword("");
                          }
                          setIsEditing((prev) => !prev);
                        }}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg transition-colors text-sm"
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={handleUpdateProfile}
                            disabled={
                              isLoading ||
                              !newPassword ||
                              newPassword !== confirmPassword
                            }
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save Password</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300">••••••••</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl">
                {/* Tabs */}
                <div className="border-b border-gray-800">
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

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "posts" && (
                    <div className="space-y-4">
                      {postsLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : userPosts && userPosts.length > 0 ? (
                        <div className="divide-y divide-gray-800">
                          {userPosts.map((post) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="py-4 first:pt-0 last:pb-0"
                            >
                              <Link
                                to={`/post/${post.id}`}
                                className="flex items-start space-x-4 hover:bg-gray-800/30 p-3 rounded-lg transition-colors"
                              >
                                {post.image_url && (
                                  <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-white font-medium mb-1 truncate">
                                    {post.title}
                                  </h3>
                                  <div
                                    className="text-gray-400 text-sm mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                      __html: post.content.replace(
                                        /<[^>]*>/g,
                                        ""
                                      ),
                                    }}
                                  />
                                  <div className="flex items-center text-sm text-gray-500">
                                    <span>
                                      {new Date(
                                        post.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      {post.comments?.length || 0} comments
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{post.votes || 0} likes</span>
                                  </div>
                                </div>
                              </Link>
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
                            You haven't created any posts yet. Start sharing
                            with the community!
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
                    <div className="space-y-4">
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
                            You haven't made any comments yet. Join the
                            conversation!
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
                    <div className="space-y-4">
                      {likesLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : userLikes && userLikes.length > 0 ? (
                        <div className="divide-y divide-gray-800">
                          {userLikes.map((post) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="py-4 first:pt-0 last:pb-0"
                            >
                              <Link
                                to={`/post/${post.id}`}
                                className="flex items-start space-x-4 hover:bg-gray-800/30 p-3 rounded-lg transition-colors"
                              >
                                {post.image_url && (
                                  <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-white font-medium mb-1 truncate">
                                    {post.title}
                                  </h3>
                                  <div
                                    className="text-gray-400 text-sm mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                      __html: post.content.replace(
                                        /<[^>]*>/g,
                                        ""
                                      ),
                                    }}
                                  />
                                  <div className="flex items-center text-sm text-gray-500">
                                    <span>
                                      {new Date(
                                        post.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      {post.comments?.length || 0} comments
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{post.votes || 0} likes</span>
                                  </div>
                                </div>
                              </Link>
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
                            You haven't liked any posts yet. Explore and find
                            content you enjoy!
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
