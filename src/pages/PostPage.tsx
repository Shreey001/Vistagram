import { useParams } from "react-router-dom";
import { PostDetail } from "../components/PostDetail";
import { motion } from "framer-motion";

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-10"
    >
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl z-0"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl z-0"></div>

        {/* Post detail section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <PostDetail postId={Number(id)} />
        </motion.div>
      </div>
    </motion.div>
  );
};
