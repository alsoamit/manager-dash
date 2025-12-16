// hooks/useUpload.tsx
"use client";

import * as React from "react";
import axios from "axios";
import useSession from "./useSession";
import { toast } from "sonner";

export type UploadType = "PROFILE" | "PRODUCT";

interface UseUploadOptions {
  type: UploadType;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export default function useUpload({ type, onSuccess, onError }: UseUploadOptions) {
  const { session } = useSession();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const upload = React.useCallback(
    async (file: File): Promise<string | null> => {
      if (!session?.user?.accessToken) {
        const error = new Error("Not authenticated");
        toast.error("Please log in to upload files");
        onError?.(error);
        return null;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        const error = new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
        toast.error(error.message);
        onError?.(error);
        return null;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const error = new Error("File size must be less than 10MB");
        toast.error(error.message);
        onError?.(error);
        return null;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Step 1: Get presigned URL
        const presignedResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/upload/presigned-url`,
          {
            type,
            filename: file.name,
            filesize: file.size,
          },
          {
            headers: {
              Authorization: session.user.accessToken,
            },
          }
        );

        const { url: presignedUrl, key } = presignedResponse.data.data;

        // Step 2: Upload to S3 using presigned URL
        await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        });

        // Step 3: Return the final URL (without query params)
        const finalUrl = key || presignedUrl.split("?")[0];
        
        // If CloudFront is configured, replace S3 URL with CDN URL
        // const cdnUrl = finalUrl.replace(
        //   `${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`,
        //   process.env.NEXT_PUBLIC_CDN_URL || ""
        // );

        setIsUploading(false);
        setUploadProgress(0);
        toast.success("File uploaded successfully");
        onSuccess?.(finalUrl);
        return finalUrl;
      } catch (error: any) {
        setIsUploading(false);
        setUploadProgress(0);
        const errorMessage =
          error?.response?.data?.msg ||
          error?.message ||
          "Failed to upload file. Please try again.";
        toast.error(errorMessage);
        const uploadError = new Error(errorMessage);
        onError?.(uploadError);
        return null;
      }
    },
    [type, session, onSuccess, onError]
  );

  return {
    upload,
    isUploading,
    uploadProgress,
  };
}
