import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  postId: number;
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

  const { error } = await supabase.from("comments").insert({
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
    post_id: postId,
    user_id: userId,
    author: author,
  });
  if (error) throw new Error(error.message);
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

export const CommentSection = ({ postId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCommentText, setNewCommentText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (newComment: NewComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
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
      {/* Comment Form */}
      <AnimatePresence mode="wait">
        {user ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="relative"
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
                name="comment"
                placeholder="Share your thoughts..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onFocus={() => setIsComposing(true)}
                onBlur={() => !newCommentText && setIsComposing(false)}
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
                  Failed to post comment. Please try again.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 text-center"
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
      <div className="space-y-6">
        <AnimatePresence>
          {commentTree.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <CommentItem comment={comment} postId={postId} />
            </motion.div>
          ))}
        </AnimatePresence>

        {commentTree.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <p>No comments yet. Be the first to share your thoughts!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
