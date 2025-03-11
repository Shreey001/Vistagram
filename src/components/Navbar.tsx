import { Link } from "react-router";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signInWithGithub, signOut } = useAuth();

  const displayName = user?.user_metadata.user_name || user?.email;

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-mono text-xl font-bold text-white">
            <img className="w-25 h-15 rounded-full " src={logo} alt="logo" />
          </Link>

          {/* desktop link */}

          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors "
            >
              Home
            </Link>

            <Link
              to="/create"
              className="text-gray-300 hover:text-white transition-colors "
            >
              Create Post
            </Link>

            <Link
              to="/communities"
              className="text-gray-300 hover:text-white transition-colors "
            >
              Communities
            </Link>

            <Link
              to="/community/create"
              className="text-gray-300 hover:text-white transition-colors "
            >
              Create Community
            </Link>
          </div>

          {/* desktop auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300">{displayName}</span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={signOut}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={signInWithGithub}
              >
                Sign in with Github
              </button>
            )}
          </div>

          {/* mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen((prev) => !prev)}>
              <svg
                className="w-6 h-6"
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
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[rgba(10,10,10,0.9)]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 "
            >
              Home
            </Link>

            <Link
              to="/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700"
            >
              Create Post
            </Link>

            <Link
              to="/communities"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 "
            >
              Communities
            </Link>

            <Link
              to="/community/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 "
            >
              Create Community
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
