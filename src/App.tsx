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

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 to-black text-gray-100 transition-opacity duration-700 pt-20">
      {/* Background graphics */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent opacity-40"></div>
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/posts" element={<AllPostsPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/community/create" element={<CreateCommunityPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/community/:id" element={<CommunityPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
