import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";

interface AIGeneratedImage {
  url: string;
  prompt: string;
}

export const CreateAIPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<AIGeneratedImage | null>(
    null
  );

  const generateImage = async () => {
    if (!prompt) {
      setError("Please enter a prompt for the image generation");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const options = {
      method: "GET",
      url: "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/fluximagegenerate/generateimage.php",
      params: {
        prompt: prompt,
        width: "1024",
        height: "1024",
        model: "flux-pro",
      },
      headers: {
        Accept: "application/json",
        "Content-Type": null,
        "x-rapidapi-ua": "RapidAPI-Playground",
        "x-rapidapi-key": "96c38dda83msh112af688d4b9555p1d9298jsn99ea2d122976",
        "x-rapidapi-host":
          "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
      },
      responseType: "arraybuffer" as const,
    };

    try {
      const response = await axios.request(options);
      console.log("API Response:", response.data);
      // Create a blob URL from the image data
      const blob = new Blob([response.data], { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(blob);

      setGeneratedImage({
        url: imageUrl,
        prompt: prompt,
      });
      setError(null);
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!title || !content || !generatedImage) {
      setError("Please fill in all fields and generate an image");
      return;
    }

    try {
      // Function to compress image with more aggressive settings
      const compressImage = async (url: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous"; // Add this to handle CORS
          img.src = url;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            // Reduce maximum dimensions further
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            const aspectRatio = width / height;
            if (aspectRatio > 1) {
              width = Math.min(width, MAX_WIDTH);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, MAX_HEIGHT);
              width = height * aspectRatio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }

            // Use better image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob with lower quality
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  console.log("Compressed image size:", blob.size / 1024, "KB");
                  resolve(blob);
                } else {
                  reject(new Error("Could not compress image"));
                }
              },
              "image/jpeg",
              0.6 // Reduced quality to 60%
            );
          };
          img.onerror = () => reject(new Error("Could not load image"));
        });
      };

      // Convert to base64 with size logging
      const convertToBase64 = async (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            console.log("Base64 string length:", base64String.length);
            // Keep the full data URL format
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      console.log("Starting image compression...");
      const compressedBlob = await compressImage(generatedImage.url);
      console.log("Image compressed successfully");

      console.log("Converting to base64...");
      const base64String = await convertToBase64(compressedBlob);
      console.log("Conversion to base64 complete");

      // Log the final data size
      console.log("Final data size:", base64String.length, "characters");

      // Insert post with compressed base64 image
      console.log("Sending request to Supabase...");

      // First, try to validate the data
      const postData = {
        title: title.trim(),
        content: content.trim(),
        image_url: base64String,
        user_id: user.id,
        user_name: user.user_metadata.user_name || user.email,
        avatar_url:
          user.user_metadata.avatar_url ||
          "https://api.dicebear.com/7.x/avatars/svg?seed=" + user.id, // Default avatar if none exists
        created_at: new Date().toISOString(),
      };

      console.log("Attempting to insert with data structure:", {
        ...postData,
        image_url: `${postData.image_url.substring(0, 50)}... (truncated)`,
      });

      try {
        const { data, error: postError } = await supabase
          .from("posts")
          .insert([postData])
          .select()
          .single();

        if (postError) {
          console.error("Supabase error details:", postError);
          if (
            postError.message.includes("too large") ||
            postError.message.includes("size")
          ) {
            throw new Error(
              "Image file is too large. Please try with a shorter prompt."
            );
          }
          throw postError;
        }

        console.log("Post created successfully:", data);

        // Clean up the blob URL
        URL.revokeObjectURL(generatedImage.url);

        // Navigate to the home page after successful post creation
        navigate("/");
      } catch (err: any) {
        console.error("Detailed error:", {
          message: err.message,
          details: err.details,
          hint: err.hint,
          code: err.code,
          status: err.status,
        });

        // More specific error messages
        if (err.code === "23505") {
          setError("A post with this title already exists.");
        } else if (err.code === "23503") {
          setError("There was an issue with the user reference.");
        } else if (err.message.includes("too large")) {
          setError("The image is too large. Please try with a shorter prompt.");
        } else {
          setError(err.message || "Failed to create post. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Detailed error:", {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
      });
      setError(err.message || "Failed to create post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 pt-24 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
          >
            Create with AI Magic ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg"
          >
            Transform your ideas into stunning visuals with AI-powered image
            generation
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter a captivating title..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Image Prompt
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] transition-all duration-300"
                      placeholder="Describe the image you want to create..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateImage}
                      disabled={isGenerating}
                      type="button"
                      className={`absolute bottom-4 right-4 px-6 py-2 rounded-lg font-medium ${
                        isGenerating
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25"
                      } transition-all duration-300`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V8.625H19"
                            />
                          </svg>
                          Generate
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Post Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px] transition-all duration-300"
                    placeholder="Write your post content..."
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Create Post
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="sticky top-28">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Preview
                </h2>
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative group"
                    >
                      <img
                        src={generatedImage.url}
                        alt="AI Generated"
                        className="w-full h-auto max-h-[512px] object-contain rounded-xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <p className="text-white text-sm px-6 py-4 bg-black/80 rounded-lg backdrop-blur-sm">
                          {generatedImage.prompt}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="aspect-square rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-8"
                    >
                      <div className="text-center">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm">
                          Your AI-generated image will appear here
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
