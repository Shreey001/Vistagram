import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type FormMode = "login" | "signup" | "reset";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMode, setFormMode] = useState<FormMode>("login");
  const { signIn, signUp, resetPassword, signInWithGithub, authError, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formMode === "login") {
      await signIn(email, password);
    } else if (formMode === "signup") {
      await signUp(email, password);
    } else if (formMode === "reset") {
      await resetPassword(email);
      // Show success message after reset email is sent
      alert("If your email exists in our system, you will receive a password reset link.");
      setFormMode("login");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      <AnimatePresence mode="wait">
        <motion.div
          key={formMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {formMode === "login" && "Sign In"}
            {formMode === "signup" && "Create Account"}
            {formMode === "reset" && "Reset Password"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-1 flex items-center justify-between">
                <span>Email Address</span>
                {email && <span className="text-xs text-purple-400">Required</span>}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {formMode !== "reset" && (
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-300 mb-1 flex items-center justify-between">
                  <span>Password</span>
                  {password && <span className="text-xs text-purple-400">{formMode === "signup" ? "Min 6 characters" : "Required"}</span>}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    placeholder={formMode === "signup" ? "Create a password" : "Enter your password"}
                    minLength={6}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm font-medium">{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading
                  ? "bg-purple-500/50 text-white/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {formMode === "login" && "Signing in..."}
                  {formMode === "signup" && "Creating account..."}
                  {formMode === "reset" && "Sending reset link..."}
                </span>
              ) : (
                <>
                  {formMode === "login" && "Sign In"}
                  {formMode === "signup" && "Create Account"}
                  {formMode === "reset" && "Send Reset Link"}
                </>
              )}
            </motion.button>
            
            {(formMode === "login" || formMode === "signup") && (
              <div className="mt-4">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-700 w-full"></div>
                  <div className="text-xs text-gray-500 bg-gray-900/50 px-2 absolute">OR</div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={signInWithGithub}
                  disabled={isLoading}
                  className="w-full mt-4 px-6 py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {formMode === "login" ? "Sign in with GitHub" : "Sign up with GitHub"}
                </motion.button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            {formMode === "login" && (
              <>
                <p className="text-gray-400 mb-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setFormMode("signup")}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => setFormMode("reset")}
                  className="text-gray-500 hover:text-gray-400"
                >
                  Forgot password?
                </button>
              </>
            )}

            {formMode === "signup" && (
              <p className="text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setFormMode("login")}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {formMode === "reset" && (
              <p className="text-gray-400">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setFormMode("login")}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};