import { PostList } from "../components/PostList";

export const Home = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="space-y-4">
        <h2 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 text-center">
          Recent Posts
        </h2>
        <div className="bg-gray-900/30 p-6 rounded-lg shadow-lg border border-purple-500/20">
          <PostList />
        </div>
      </div>
    </div>
  );
};
