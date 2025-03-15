import { useState, useRef, useEffect } from "react";
import { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  comment: Comment & { children?: Comment[] };
  postId: number;
  parentAuthor?: string;
  redditStyle?: boolean;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
) => {
  if (!userId && !author) {
    throw new Error("User ID or author is required to reply");
  }

  const { error } = await supabase.from("comments").insert({
    content: replyContent,
    parent_comment_id: parentCommentId,
    post_id: postId,
    user_id: userId,
    author: author,
  });
  if (error) throw new Error(error.message);
};

const formatRelativeTime = (date: string) => {
  const now = new Date();
  const commentDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - commentDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 7) {
    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        commentDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } else if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  }
  return "Just now";
};

export const CommentItem = ({
  comment,
  postId,
  parentAuthor,
  redditStyle = false,
}: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [replyText]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isPending) return;
    mutate(replyText);
    setReplyText("");
    setShowReply(false);
    setIsComposing(false);
  };

  const getInitials = (name: string) => {
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

  const avatarColor = getRandomColor(comment.author);
  const isRootComment = !comment.parent_comment_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group ${isRootComment ? "" : "ml-8 mt-3"}`}
    >
      <div className={`relative ${isRootComment ? "pb-6" : "pb-3"}`}>
        {!isRootComment && (
          <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/40 to-transparent"></div>
        )}

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {redditStyle ? (
              <div
                className={`w-8 h-8 rounded-full ${getRandomColor(
                  comment.author
                )} flex items-center justify-center text-white font-medium text-sm`}
              >
                {getInitials(comment.author)}
              </div>
            ) : (
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-medium text-sm`}
              >
                {getInitials(comment.author)}
              </div>
            )}
          </div>

          {/* Comment content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className={`font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ${
                  isRootComment ? "text-base" : "text-sm"
                }`}
              >
                {comment.author}
              </span>

              {parentAuthor && !isRootComment && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
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
                  <span className="text-gray-300">@{parentAuthor}</span>
                </div>
              )}

              <span
                className={`text-gray-500 ${
                  isRootComment ? "text-xs" : "text-xs"
                }`}
              >
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            <div className={`mt-1 ${isRootComment ? "mb-3" : "mb-2"}`}>
              <p
                className={`text-gray-300 break-words ${
                  isRootComment ? "text-base" : "text-sm"
                }`}
              >
                {comment.content}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReply((prev) => !prev)}
                className={`text-gray-400 hover:text-white transition-colors flex items-center gap-1 ${
                  isRootComment ? "text-sm" : "text-xs"
                }`}
              >
                <svg
                  className={`${isRootComment ? "w-4 h-4" : "w-3 h-3"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                {showReply ? "Cancel" : "Reply"}
              </button>

              {comment.children && comment.children.length > 0 && (
                <button
                  onClick={() => setIsCollapsed((prev) => !prev)}
                  className={`text-gray-400 hover:text-white transition-colors flex items-center gap-1 ${
                    isRootComment ? "text-sm" : "text-xs"
                  }`}
                >
                  <svg
                    className={`transform transition-transform duration-200 ${
                      isCollapsed ? "" : "rotate-180"
                    } ${isRootComment ? "w-4 h-4" : "w-3 h-3"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {isCollapsed ? "Show" : "Hide"} {comment.children.length}{" "}
                  {comment.children.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply form */}
        <AnimatePresence>
          {showReply && user && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleReplySubmit}
              className="overflow-hidden ml-8 mt-3"
            >
              <div
                className={`relative transition-all duration-300 ${
                  isComposing ? "bg-gray-900/50" : "bg-transparent"
                } rounded-xl p-4 border border-purple-500/20 focus-within:border-pink-500/40 focus-within:shadow-lg focus-within:shadow-pink-500/10`}
              >
                <div className="text-xs text-gray-400 mb-2">
                  Replying to{" "}
                  <span className="text-purple-400">@{comment.author}</span>
                </div>
                <textarea
                  ref={textareaRef}
                  className="w-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                  rows={1}
                  placeholder={`Reply to ${comment.author}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsComposing(true)}
                  onBlur={() => !replyText && setIsComposing(false)}
                />

                <motion.div
                  initial={false}
                  animate={{
                    height: isComposing ? "auto" : 0,
                    opacity: isComposing ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-500/20">
                    <div className="text-sm text-gray-400">
                      {replyText.length} / 1000 characters
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyText("");
                          setShowReply(false);
                          setIsComposing(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyText.trim() || isPending}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
                          !replyText.trim() || isPending
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
                          "Post Reply"
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
                    className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm"
                  >
                    Failed to post reply. Please try again.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Nested replies */}
        <AnimatePresence>
          {!isCollapsed && comment.children && comment.children.length > 0 && (
            <div
              className={`mt-4 pl-4 md:pl-8 border-l-2 ${
                isCollapsed ? "hidden" : "block"
              } border-gray-800`}
            >
              {comment.children.map((childComment) => (
                <div key={childComment.id} className="mb-4 last:mb-0">
                  <CommentItem
                    comment={childComment}
                    postId={postId}
                    parentAuthor={comment.author}
                    redditStyle={redditStyle}
                  />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
