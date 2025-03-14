import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Post } from "./PostList";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { useState, useEffect, useRef } from "react";

interface Props {
  postId: number;
}

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Post;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const PostDetail = ({ postId }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const postContainerRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Scroll to the top of the post when it loads
      if (postContainerRef.current) {
        window.scrollTo({
          top: postContainerRef.current.offsetTop - 20,
          behavior: "smooth",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-t-4 border-b-4 border-purple-400 animate-spin-slower"></div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Loading your post
            </p>
            <p className="text-gray-400 text-sm">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-xl w-full mx-auto transform hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg
              className="absolute inset-0 w-full h-full text-red-500 animate-pulse"
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
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-300 text-sm">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={postContainerRef}
      className={`max-w-4xl mx-auto bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-500/20 overflow-hidden transition-all duration-700 hover:shadow-pink-500/20 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl transition-opacity duration-500 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          } flex items-center justify-center`}
        >
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <img
          src={data?.image_url}
          alt={data?.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            imageLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent opacity-90"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-400 to-pink-500 leading-tight">
              {data?.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>{formatDate(data!.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="prose prose-lg prose-invert prose-headings:text-pink-400 prose-a:text-purple-400 prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300 max-w-none">
          {/* Check if content contains HTML tags */}
          {data?.content.includes("<") && data?.content.includes(">") ? (
            <div dangerouslySetInnerHTML={{ __html: data?.content }} />
          ) : (
            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap first-letter:text-4xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-pink-500">
              {data?.content}
            </p>
          )}
        </div>

        <div className="mt-12 space-y-8">
          <div className="border-t border-purple-500/20 pt-8">
            <LikeButton postId={postId} />
          </div>
          <div className="border-t border-purple-500/20 pt-8">
            <CommentSection postId={postId} />
          </div>
        </div>
      </div>
    </div>
  );
};
