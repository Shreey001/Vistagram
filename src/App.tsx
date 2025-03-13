import { Routes, Route } from "react-router";
import { Home } from "./pages/Home";
import { Navbar } from "./components/Navbar";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostPage } from "./pages/PostPage";
import { Footer } from "./components/Footer";
import { AboutUs } from "./pages/AboutUs";
import { CreateCommunityPage } from "./pages/CreateCommunity";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { CommunityPage } from "./pages/Community";
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 transition-opacity duration-700 pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/community/create" element={<CreateCommunityPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/community/:id" element={<CommunityPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
