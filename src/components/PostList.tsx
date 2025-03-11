import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";

export interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  avatar_url: string | null;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as Post[];
};

export const PostList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-pink-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Loading posts...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-xl mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
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
          <h3 className="text-2xl font-bold text-red-500 mb-2">
            Error Loading Posts
          </h3>
          <p className="text-gray-300">{error.message}</p>
        </div>
      </div>
    );

  if (data?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-8 max-w-xl mx-auto">
          <p className="text-2xl font-bold text-gray-300 mb-4">No posts yet</p>
          <p className="text-gray-400 mb-6">Be the first to create a post!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-10 animate-fadeIn">
      {data?.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};
