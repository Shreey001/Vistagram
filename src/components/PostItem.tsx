import { Link } from "react-router";
import { Post } from "./PostList";

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  return (
    <div className="bg-gray-900/50 shadow-lg rounded-lg overflow-hidden border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 hover:shadow-pink-500/20 hover:shadow-xl transform hover:-translate-y-1">
      <Link to={`/post/${post.id}`}>
        <div className="p-4">
          {/* Header: Avatar and Title */}
          <div className="flex items-center gap-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {post.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-100 hover:text-pink-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {/* Image banner */}
        <div className="relative group">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent text-white p-3">
            <span className="font-semibold text-pink-300">{post.title}</span>
            <p className="text-sm text-gray-300 line-clamp-2 mt-1">
              {post.content.substring(0, 100)}...
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
