import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Post } from "../components/PostList";
import { Comment as BaseComment } from "../components/CommentSection";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import { CoverPhotoUpload } from "../components/CoverPhotoUpload";
import { UserPostList } from "../components/UserPostList";
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

  // Fetch user's posts
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn: () => fetchUserPosts(user?.id || ""),
    enabled: !!user?.id,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {!user ? (
          <div className="text-center text-gray-300">
            You need to be logged in to view your profile.
          </div>
        ) : (
          <div>
            {/* Cover Photo */}
            <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] rounded-xl overflow-hidden mb-4">
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
              <CoverPhotoUpload />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Left Column - Profile Info and Settings */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                {/* Profile Card */}
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-4 sm:p-6 lg:sticky lg:top-[100px]">
                  <div className="flex flex-col items-center">
                    <div className="relative -mt-20 sm:-mt-24">
                      <ProfilePictureUpload />
                    </div>
                    <div className="text-center mt-4 sm:mt-6">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">
                        {user.user_metadata?.user_name ||
                          user.email?.split("@")[0] ||
                          "Anonymous User"}
                      </h1>
                      <p className="text-sm sm:text-base text-gray-400 mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full mt-6 sm:mt-8">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {posts?.length || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Posts
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {userComments?.length || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Comments
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {userLikes?.length || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Likes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                    Profile Settings
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Username Section */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-medium text-white">
                          Username
                        </h3>
                        <button
                          onClick={() => setIsEditing((prev) => !prev)}
                          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 sm:px-3 sm:py-1 rounded-lg transition-colors text-xs sm:text-sm"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                      </div>
                      {isEditing ? (
                        <div className="space-y-3 sm:space-y-4">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Enter new username"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={handleUpdateProfile}
                              disabled={
                                isLoading ||
                                newUsername === user.user_metadata?.user_name
                              }
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save Username</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base text-gray-300">
                          {user.user_metadata?.user_name || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* Password Section */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-medium text-white">
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
                          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 sm:px-3 sm:py-1 rounded-lg transition-colors text-xs sm:text-sm"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                      </div>
                      {isEditing ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
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
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save Password</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base text-gray-300">
                          ••••••••
                        </p>
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
                        className={`flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-colors ${
                          activeTab === "posts"
                            ? "text-purple-400 border-b-2 border-purple-500"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Posts
                      </button>
                      <button
                        onClick={() => setActiveTab("comments")}
                        className={`flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-colors ${
                          activeTab === "comments"
                            ? "text-purple-400 border-b-2 border-purple-500"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Comments
                      </button>
                      <button
                        onClick={() => setActiveTab("likes")}
                        className={`flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-colors ${
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
                  <div className="p-4 sm:p-6">
                    {activeTab === "posts" && (
                      <div>
                        {postsLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                          </div>
                        ) : postsError ? (
                          <div className="text-center py-8 text-red-400">
                            Failed to load posts
                          </div>
                        ) : (
                          <UserPostList
                            posts={posts || []}
                            userId={user?.id || ""}
                          />
                        )}
                      </div>
                    )}

                    {activeTab === "comments" && (
                      <div className="space-y-4">
                        {commentsLoading ? (
                          <div className="flex justify-center py-8 sm:py-12">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : userComments && userComments.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4">
                            {userComments.map((comment) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-800/50 rounded-lg p-3 sm:p-4 hover:bg-gray-800/80 transition-colors"
                              >
                                <div className="flex items-start gap-3 sm:gap-4">
                                  <div className="flex-shrink-0">
                                    {user.user_metadata?.avatar_url ? (
                                      <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Profile"
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                        {getInitials()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                                      <div>
                                        <span className="text-sm sm:text-base text-white font-medium">
                                          {displayName}
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-400 ml-2">
                                          {new Date(
                                            comment.created_at
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3">
                                      {comment.content}
                                    </p>
                                    {comment.posts && (
                                      <Link
                                        to={`/post/${comment.posts.id}`}
                                        className="flex items-center gap-2 bg-gray-900/50 p-2 sm:p-3 rounded-lg hover:bg-gray-900/80 transition-colors"
                                      >
                                        <img
                                          src={comment.posts.image_url}
                                          alt={comment.posts.title}
                                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                                        />
                                        <span className="text-xs sm:text-sm text-gray-300 line-clamp-1">
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
                          <div className="text-center py-8 sm:py-12">
                            <svg
                              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-3 sm:mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                            <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
                              No comments yet
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500">
                              You haven't made any comments yet. Join the
                              conversation!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "likes" && (
                      <div className="space-y-4">
                        {likesLoading ? (
                          <div className="flex justify-center py-8 sm:py-12">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : userLikes && userLikes.length > 0 ? (
                          <div className="divide-y divide-gray-800">
                            {userLikes.map((post) => (
                              <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="py-3 sm:py-4 first:pt-0 last:pb-0"
                              >
                                <Link
                                  to={`/post/${post.id}`}
                                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 group"
                                >
                                  <div className="flex-shrink-0">
                                    <img
                                      src={post.image_url}
                                      alt={post.title}
                                      className="w-full sm:w-32 h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                      {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1 sm:mt-2 line-clamp-2">
                                      {post.content}
                                    </p>
                                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
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
                          <div className="text-center py-8 sm:py-12">
                            <svg
                              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-3 sm:mb-4"
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
                            <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
                              No likes yet
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500">
                              You haven't liked any posts yet. Start exploring!
                            </p>
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
    </div>
  );
};

export default ProfilePage;
