"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useBillStore } from "@/store/bill-store";
import { useUIStore } from "@/store/ui-store";
import type { ParseResult } from "@/types";

export function CameraCapture() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setBillData = useBillStore((state) => state.setBillData);
  const setCurrentStep = useBillStore((state) => state.setCurrentStep);
  const setIsParsing = useUIStore((state) => state.setIsParsing);
  const setError = useUIStore((state) => state.setError);

  // React Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".heic", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0]?.errors[0];
        const errorMessage =
          error?.code === "file-too-large"
            ? "File is too large. Maximum size is 10MB."
            : "Invalid file type. Please upload an image.";
        toast.error(errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        handleFileSelected(acceptedFiles[0] as Blob);
      }
    },
  });

  const handleFileSelected = (file: Blob) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setIsParsing(true);

    try {
      // Create FormData and send to API route
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/parse-bill", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse bill");
      }

      const result: ParseResult = await response.json();

      // Update store with parsed data
      setBillData({
        items: result.items,
        merchantName: result.merchantName,
        currency: result.currency,
        subtotal: result.subtotal,
        tax: result.tax,
        tip: result.tip,
        total: result.total,
      });

      // Clean up preview
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setSelectedFile(null);

      // Move to next step
      setCurrentStep("review");
      toast.success("Receipt parsed successfully!");
    } catch (error) {
      console.error("Parse error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse receipt";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCancel = () => {
    // Clean up preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        // Upload/Capture Interface
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            {...getRootProps()}
            className={`glass rounded-2xl p-8 sm:p-12 border-2 border-dashed transition-all cursor-pointer ${
              isDragActive
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isDragActive
                  ? "Drop your receipt here"
                  : "Drag & drop receipt image"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports: JPG, PNG, HEIC, WebP (max 10MB)
              </p>
            </div>
          </div>

          {/* Camera Capture Button */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <button
            onClick={handleCameraClick}
            className="w-full btn-primary flex items-center justify-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Take Photo with Camera
          </button>

          {/* Hidden file input for camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelected(file);
              }
            }}
            className="hidden"
          />
        </div>
      ) : (
        // Preview Modal
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Preview Receipt
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Make sure the receipt is clear and readable
              </p>
            </div>

            {/* Image Preview */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
              <Image
                src={preview}
                alt="Receipt preview"
                width={800}
                height={1200}
                className="w-full h-auto rounded-lg shadow-lg"
                unoptimized
              />
            </div>

            {/* Actions */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Use This Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
