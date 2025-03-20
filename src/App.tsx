import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Navbar } from "./components/Navbar";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostPage } from "./pages/PostPage";
import { Footer } from "./components/Footer";
import { AboutUs } from "./pages/AboutUs";
import { CreateCommunityPage } from "./pages/CreateCommunity";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { CommunityPage } from "./pages/Community";
import { AllPostsPage } from "./pages/AllPostsPage";
import { LoginPage } from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import { CreateAIPost } from "./components/CreateAIPost";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-gray-100">
          {/* Background graphics */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent opacity-40"></div>
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
          </div>

          {/* Fixed Navbar */}
          <Navbar />

          {/* Main Content with top padding for navbar */}
          <main className="pt-16">
            {" "}
            {/* Add padding-top to account for fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/all-posts" element={<AllPostsPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route
                path="/community/create"
                element={<CreateCommunityPage />}
              />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/community/:id" element={<CommunityPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create-ai" element={<CreateAIPost />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
