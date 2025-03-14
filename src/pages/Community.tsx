import { CommunityDisplay } from "../components/CommunityDisplay";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

export const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="relative">
        {/* Subtle background decorations */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full filter blur-3xl z-0"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/5 rounded-full filter blur-3xl z-0"></div>

        {/* Community display section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <CommunityDisplay communityId={Number(id)} />
        </motion.div>
      </div>
    </motion.div>
  );
};
