import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const AnimatedLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-3 group">
      <motion.img
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        src="/vistagram-logo.svg"
        alt="Vistagram"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-transparent group-hover:border-pink-500 transition-all duration-300"
      />
      <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        Vistagram
      </span>
    </Link>
  );
};
