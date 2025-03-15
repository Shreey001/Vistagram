import { LoginForm } from "../components/LoginForm";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const LoginPage = () => {
  const { user } = useAuth();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Welcome to Vistagram
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Sign in to your account or create a new one to start sharing and discovering visual stories.
        </p>
      </motion.div>

      <LoginForm />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;