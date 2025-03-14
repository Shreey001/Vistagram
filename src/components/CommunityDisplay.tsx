import { useQuery } from "@tanstack/react-query";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { motion } from "framer-motion";

interface Props {
  communityId: number;
}

export const fetchCommunityPost = async (
  communityId: number
): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*,communities(name)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Post[];
};

export const CommunityDisplay = ({ communityId }: Props) => {
  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["communityPosts", communityId],
    queryFn: () => fetchCommunityPost(Number(communityId)),
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl text-red-400">Error: {error.message}</div>
      </div>
    );

  // Get community name from first post or fetch it separately if no posts
  const communityName = data && data[0]?.communities?.name;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {communityName ? `${communityName} Community` : "Community"} Posts
      </h2>

      {data && data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {data.map((post, key) => (
            <PostItem key={key} post={post} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/30 rounded-2xl border border-purple-500/20 p-8"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-gray-300 mb-2">
            No Posts Yet
          </h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            Be the first one to share your creative work in this community!
          </p>
          <a
            href="/create"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
          >
            Create First Post
          </a>
        </motion.div>
      )}
    </div>
  );
};
