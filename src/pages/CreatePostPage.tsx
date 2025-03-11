import { CreatePost } from "../components/CreatePost";

export const CreatePostPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-4xl font-bold mb-6 text-pink-500 text-center">
        Create New Post
      </h2>

      <CreatePost />
    </div>
  );
};
