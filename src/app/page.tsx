"use client";

import { useBillStore } from "@/store/bill-store";
import { useUIStore } from "@/store/ui-store";
import { CameraCapture } from "@/components/features/bill-capture/camera-capture";
import { ReviewItems } from "@/components/features/items/review-items";
import { ParticipantManager } from "@/components/features/participants/participant-manager";
import { ItemAssignment } from "@/components/features/items/item-assignment";
import { SummaryView } from "@/components/features/summary/summary-view";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const { currentStep } = useBillStore();
  const { clearError, error, isParsing } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-blue-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-start justify-between">
              <p className="text-sm sm:text-base text-red-800 dark:text-red-200">
                {error}
              </p>
              <button
                onClick={clearError}
                className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isParsing && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              Analyzing your bill with AI...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Step Content */}
        {!isParsing && (
          <>
            {currentStep === "capture" && <CameraCapture />}
            {currentStep === "review" && <ReviewItems />}
            {currentStep === "participants" && <ParticipantManager />}
            {currentStep === "assignment" && <ItemAssignment />}
            {currentStep === "summary" && <SummaryView />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
