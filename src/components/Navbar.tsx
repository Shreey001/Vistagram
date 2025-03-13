import { Link } from "react-router";
import logo from "../assets/logo.svg";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion"; 

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signInWithGithub, signOut } = useAuth();

  const displayName = user?.user_metadata.user_name || user?.email;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(10,10,10,0.95)] backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <motion.img 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-pink-500 transition-all duration-300" 
              src={logo} 
              alt="logo" 
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/create">Create Post</NavLink>
            <NavLink to="/communities">Communities</NavLink>
            <NavLink to="/community/create">Create Community</NavLink>
            <NavLink to="/about">About Us</NavLink>
          </div>

          {/* desktop auth */}
          <div className="hidden md:flex items-center">

            {user ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                {user.user_metadata.avatar_url && (
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30 hover:border-pink-500 transition-colors"
                  />
                )}
                <span className="text-gray-300 font-medium">{displayName}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                  onClick={signOut}
                >
                  Sign out
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                onClick={signInWithGithub}
              >
                Sign in with Github
              </motion.button>
            )}
          </div>

          {/* mobile menu button */}
          <motion.div 
            className="md:hidden"
            whileTap={{ scale: 0.95 }}
          >
            <button 
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <motion.svg
                animate={{ rotate: menuOpen ? 180 : 0 }}
                className="w-6 h-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </motion.svg>
            </button>
          </motion.div>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[rgba(10,10,10,0.9)]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink to="/">Home</MobileNavLink>
              <MobileNavLink to="/create">Create Post</MobileNavLink>
              <MobileNavLink to="/communities">Communities</MobileNavLink>
              <MobileNavLink to="/community/create">Create Community</MobileNavLink>
              <MobileNavLink to="/about">About Us</MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 transition-all duration-300"
  >
    {children}
  </Link>
);
