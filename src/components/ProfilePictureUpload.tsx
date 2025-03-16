import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

export const ProfilePictureUpload = () => {
  const { user, refreshSession } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("File must be an image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Try to upload to the avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image. Please try again.");
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          avatar_file_path: filePath,
        },
      });

      if (updateError) throw updateError;

      // Clean up old avatar if exists
      if (
        user.user_metadata?.avatar_file_path &&
        user.user_metadata.avatar_file_path !== filePath
      ) {
        try {
          await supabase.storage
            .from("avatars")
            .remove([user.user_metadata.avatar_file_path]);
        } catch (error) {
          console.warn("Failed to remove old avatar:", error);
          // Don't throw error here as the upload was successful
        }
      }

      // Refresh the session to get updated user data
      await refreshSession();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    if (!user || !user.user_metadata) return "?";
    const { first_name, last_name } = user.user_metadata;
    if (first_name && last_name) {
      return (first_name[0] + last_name[0]).toUpperCase();
    }
    return "?";
  };

  return (
    <div className="relative group">
      {user?.user_metadata?.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-purple-500/20 object-cover shadow-xl"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-500/20 shadow-xl">
          {getInitials()}
        </div>
      )}
      <label
        htmlFor="avatar-upload"
        className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="text-white text-center">
          <svg
            className="w-8 h-8 mx-auto mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">Change Photo</span>
        </div>
      </label>
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {uploadError && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
          {uploadError}
        </div>
      )}
    </div>
  );
};
