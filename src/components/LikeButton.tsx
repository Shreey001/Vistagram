import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

interface Props {
  postId: number;
  minimal?: boolean;
}

interface Vote {
  id: number;
  post_id: number;
  vote: number;
  user_id: string;
}
const vote = async (voteValue: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    //Liked => 0 ,Like => -1
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("votes").insert({
      post_id: postId,
      vote: voteValue,
      user_id: userId,
    });
    if (error) throw new Error(error.message);
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  return data as Vote[];
};

export const LikeButton = ({ postId, minimal = false }: Props) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000,
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) {
        throw new Error("login to vote");
      }
      return vote(voteValue, postId, user.id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  if (isLoading) {
    return <div>Loading Votes</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const likes = votes?.filter((v) => v.vote == 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote == -1).length || 0;

  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  // If minimal is true, render a simplified version
  if (minimal) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => mutate(1)}
          disabled={!user}
          className={`flex items-center text-sm transition-colors ${
            userVote === 1
              ? "text-pink-500"
              : "text-gray-400 hover:text-pink-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          {likes || 0}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 my-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => mutate(1)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          userVote === 1
            ? " text-white  border border-pink-500/50"
            : "bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-purple-500/30 hover:border-pink-500/50"
        }`}
        disabled={!user}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
          animate={
            userVote === 1
              ? { scale: [1, 1.2, 1], fill: ["#9f7aea", "#ec4899"] }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </motion.svg>
        <span className="font-medium">{likes}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => mutate(-1)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          userVote === -1
            ? " text-white shadow-lg  border border-orange-500/50"
            : "bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-red-500/30 hover:border-orange-500/50"
        }`}
        disabled={!user}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
          animate={
            userVote === -1
              ? { scale: [1, 1.2, 1], fill: ["#ef4444", "#f97316"] }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
        </motion.svg>
        <span className="font-medium">{dislikes}</span>
      </motion.button>

      {!user && (
        <span className="text-sm text-gray-500 italic">Sign in to vote</span>
      )}
    </div>
  );
};
