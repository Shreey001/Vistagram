import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  postId: number;
  redditStyle?: boolean;
}

interface NewComment {
  content: string;
  parent_comment_id?: number | null;
}

export interface Comment {
  id: number;
  content: string;
  parent_comment_id?: number | null;
  post_id: number;
  user_id: string;
  author: string;
  created_at: string;
}

const createComment = async (
  newComment: NewComment,
  postId: number,
  userId?: string,
  author?: string
) => {
  if (!userId && !author) {
    throw new Error("User ID or author is required");
  }

  console.log("Creating comment with data:", {
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
    post_id: postId,
    user_id: userId,
    author: author,
  });

  try {
    // Create the comment with both user_id and author fields
    const { data, error } = await supabase.from("comments").insert({
      content: newComment.content,
      parent_comment_id: newComment.parent_comment_id || null,
      post_id: postId,
      user_id: userId,
      author: author,
    });

    if (error) {
      console.error("Error creating comment:", error);

      // If there's an error with the user_id field, try without it
      if (error.message.includes("user_id") && author) {
        console.log("Retrying without user_id field");
        const { data: retryData, error: retryError } = await supabase
          .from("comments")
          .insert({
            content: newComment.content,
            parent_comment_id: newComment.parent_comment_id || null,
            post_id: postId,
            author: author,
          });

        if (retryError) {
          throw new Error(`Failed to create comment: ${retryError.message}`);
        }

        return retryData;
      }

      // If there's an error with the author field, try without it
      if (error.message.includes("author") && userId) {
        console.log("Retrying without author field");
        const { data: retryData, error: retryError } = await supabase
          .from("comments")
          .insert({
            content: newComment.content,
            parent_comment_id: newComment.parent_comment_id || null,
            post_id: postId,
            user_id: userId,
          });

        if (retryError) {
          throw new Error(`Failed to create comment: ${retryError.message}`);
        }

        return retryData;
      }

      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in createComment:", err);
    throw err;
  }
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Comment[];
};

export const CommentSection = ({ postId, redditStyle = false }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCommentText, setNewCommentText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commentsCount, setCommentsCount] = useState(0);

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

  // Update comments count when comments data changes
  useEffect(() => {
    if (comments) {
      setCommentsCount(comments.length);
    }
  }, [comments]);

  const {
    mutate,
    isPending,
    isError,
    error: mutationError,
  } = useMutation({
    mutationFn: (newComment: NewComment) => {
      // Ensure we have a valid author name
      const authorName =
        user?.user_metadata?.user_name ||
        user?.email?.split("@")[0] ||
        "Anonymous User";

      console.log("Using author name:", authorName, "and user ID:", user?.id);

      // Always pass both user_id and author name for better reliability
      return createComment(newComment, postId, user?.id, authorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newCommentText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPending) return;

    setIsComposing(false);
    mutate({ content: newCommentText, parent_comment_id: null });
    setNewCommentText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Build a tree of comments
  const buildCommentTree = (
    flatComments: Comment[]
  ): (Comment & { children?: Comment[] })[] => {
    const map = new Map<number, Comment & { children?: Comment[] }>();
    const roots: (Comment & { children?: Comment[] })[] = [];

    flatComments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    flatComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.children!.push(map.get(comment.id)!);
        }
      } else {
        roots.push(map.get(comment.id)!);
      }
    });

    return roots;
  };

  // Get user avatar initials
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a random color for Reddit-style avatars
  const getRandomColor = (seed: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    // Use the seed to deterministically select a color
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm animate-pulse">
            Loading comments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
        <svg
          className="w-8 h-8 text-red-500 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  const commentTree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="space-y-8">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Comments {commentsCount > 0 && <span>({commentsCount})</span>}
        </h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400">
            {commentsCount === 0
              ? "Be the first to comment"
              : commentsCount === 1
              ? "1 comment"
              : `${commentsCount} comments`}
          </span>
        </div>
      </div>

      {/* Comment Form */}
      <AnimatePresence mode="wait">
        {user ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="relative mb-10"
          >
            <div
              className={`relative transition-all duration-300 ${
                isComposing ? "bg-gray-900/50" : "bg-gray-900/30"
              } rounded-xl p-4 border border-purple-500/20 focus-within:border-pink-500/40 focus-within:shadow-lg focus-within:shadow-pink-500/10 overflow-hidden`}
            >
              <div className="flex gap-3">
                {/* User avatar */}
                <div className="flex-shrink-0">
                  {redditStyle ? (
                    <div
                      className={`w-10 h-10 rounded-full ${getRandomColor(
                        user?.user_metadata?.user_name || "anonymous"
                      )} flex items-center justify-center text-white font-medium`}
                    >
                      {getInitials(user?.user_metadata?.user_name)}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {getInitials(user?.user_metadata?.user_name)}
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                    rows={1}
                    name="comment"
                    placeholder="Add a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onFocus={() => setIsComposing(true)}
                    onBlur={() => !newCommentText && setIsComposing(false)}
                  />
                </div>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: isComposing ? "auto" : 0,
                  opacity: isComposing ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-500/20 ml-12">
                  <div className="text-sm text-gray-400">
                    {newCommentText.length} / 1000 characters
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewCommentText("");
                        setIsComposing(false);
                      }}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newCommentText.trim() || isPending}
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform ${
                        !newCommentText.trim() || isPending
                          ? "bg-purple-500/50 text-white/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5"
                      }`}
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Posting...
                        </span>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm"
                >
                  {mutationError instanceof Error
                    ? mutationError.message
                    : "Failed to post comment. Please try again."}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 text-center mb-8"
          >
            <p className="text-gray-400">
              Please{" "}
              <button className="text-purple-400 hover:text-pink-400 transition-colors font-medium">
                sign in
              </button>{" "}
              to join the conversation
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Display */}
      <div className="space-y-8">
        {commentTree.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400 bg-gray-900/20 rounded-xl border border-purple-500/10"
          >
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {commentTree.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-purple-500/10 pt-4 first:border-t-0 first:pt-0"
              >
                <CommentItem
                  comment={comment}
                  postId={postId}
                  redditStyle={redditStyle}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
