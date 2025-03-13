import { useState, useRef, useEffect } from "react";
import { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  comment: Comment & { children?: Comment[] };
  postId: number;
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

export const CommentItem = ({ comment, postId }: Props) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group pl-6 border-l border-purple-500/20 hover:border-pink-500/30 transition-colors duration-300 ${
        comment.parent_comment_id ? "pl-4 text-sm" : ""
      }`}
    >
      <div className="relative pb-6">
        <div
          className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-purple-500 group-hover:bg-pink-500 transition-colors duration-300 ${
            comment.parent_comment_id ? "w-2 h-2 -left-[25px]" : ""
          }`}
        ></div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div
                className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium overflow-hidden ${
                  comment.parent_comment_id
                    ? "w-6 h-6 text-xs"
                    : "w-8 h-8 text-sm"
                }`}
              >
                {getInitials(comment.author)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ${
                    comment.parent_comment_id ? "text-sm" : ""
                  }`}
                >
                  {comment.author}
                </span>
                <span
                  className={`text-gray-500 ${
                    comment.parent_comment_id ? "text-xs" : "text-sm"
                  }`}
                >
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
              <p
                className={`text-gray-300 mt-1 break-words ${
                  comment.parent_comment_id ? "text-sm" : ""
                }`}
              >
                {comment.content}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setShowReply((prev) => !prev)}
                  className={`text-gray-400 hover:text-white transition-colors flex items-center gap-1 ${
                    comment.parent_comment_id ? "text-xs" : "text-sm"
                  }`}
                >
                  <svg
                    className={`${
                      comment.parent_comment_id ? "w-3 h-3" : "w-4 h-4"
                    }`}
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
                      comment.parent_comment_id ? "text-xs" : "text-sm"
                    }`}
                  >
                    <svg
                      className={`transform transition-transform duration-200 ${
                        isCollapsed ? "rotate-180" : ""
                      } ${comment.parent_comment_id ? "w-3 h-3" : "w-4 h-4"}`}
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
                    {comment.children.length}{" "}
                    {comment.children.length === 1 ? "reply" : "replies"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showReply && user && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleReplySubmit}
                className="overflow-hidden"
              >
                <div
                  className={`relative transition-all duration-300 ${
                    isComposing ? "bg-gray-900/50" : "bg-transparent"
                  } rounded-xl p-4 border border-purple-500/20 focus-within:border-pink-500/40 focus-within:shadow-lg focus-within:shadow-pink-500/10`}
                >
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                    rows={1}
                    placeholder="Write a reply..."
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
                        {replyText.length} / 500 characters
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
                          className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform ${
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
        </div>
      </div>

      {/* Nested Replies */}
      {comment.children && comment.children.length > 0 && (
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {comment.children.map((child) => (
                <CommentItem key={child.id} comment={child} postId={postId} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
