"use client";

import { useEffect, useState } from "react";
import { FaImage, FaUpload, FaSpinner, FaTimes } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = "general",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [widget, setWidget] = useState<any>(null);

  useEffect(() => {
    // Only initialize the widget on the client side
    if (typeof window !== "undefined") {
      // Check if Cloudinary script is already loaded
      if (!window.cloudinary) {
        const script = document.createElement("script");
        script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = initializeWidget;
      } else {
        initializeWidget();
      }
    }

    return () => {
      // Clean up
      if (widget) {
        widget.destroy();
      }
    };
  }, []);

  const initializeWidget = async () => {
    if (!window.cloudinary) return;

    try {
      // Get the signature for secure uploads
      setIsLoading(true);
      const response = await fetch(
        `/api/cloudinary/signature?folder=${folder}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get signature");
      }

      const { signature, timestamp, cloudName, apiKey } = data.data;

      // Initialize Cloudinary widget
      const uploadWidget = window.cloudinary.createUploadWidget(
        {
          cloudName,
          apiKey,
          uploadSignature: signature,
          uploadPreset: "uhai_church",
          folder,
          timestamp,
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "webp"],
          maxFileSize: 5000000, // 5MB
          styles: {
            palette: {
              window: "#F5F5F5",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        },
        (error: any, result: any) => {
          if (error) {
            setError("Upload failed: " + error.message);
            setIsLoading(false);
          }

          if (result && result.event === "success") {
            onChange(result.info.secure_url);
            setIsLoading(false);
          }
        }
      );

      setWidget(uploadWidget);
    } catch (err) {
      setError("Failed to initialize upload widget");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (widget) {
      widget.open();
    }
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className={`border rounded ${className}`}>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-auto rounded"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
            title="Remove image"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={handleUploadClick}
        >
          {isLoading ? (
            <FaSpinner className="text-gray-400 text-4xl animate-spin mb-2" />
          ) : (
            <FaImage className="text-gray-400 text-4xl mb-2" />
          )}
          <div className="flex items-center">
            <FaUpload className="mr-2" />
            <span>
              {isLoading ? "Initializing..." : "Click to upload image"}
            </span>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
