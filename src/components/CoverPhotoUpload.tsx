import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";
import { toast } from "react-hot-toast";

export const CoverPhotoUpload = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadCoverPhoto = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setIsUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/cover-${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      if (!publicURL) {
        throw new Error("Could not get public URL for cover photo");
      }

      // Update user metadata with the new cover photo URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { cover_url: publicURL.publicUrl },
      });

      if (updateError) {
        throw updateError;
      }

      // Delete old cover photo if it exists
      if (user?.user_metadata?.cover_url) {
        const oldFilePath = user.user_metadata.cover_url
          .split("/")
          .pop()
          ?.split("?")[0];
        if (oldFilePath) {
          await supabase.storage.from("covers").remove([oldFilePath]);
        }
      }

      toast.success("Cover photo updated successfully!");
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Error uploading cover photo");
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

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadCoverPhoto}
        className="hidden"
        accept="image/*"
        id="cover-upload"
      />
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">Edit Cover Photo</span>
            <span className="sm:hidden">Edit</span>
          </>
        )}
      </button>
    </>
  );
};
