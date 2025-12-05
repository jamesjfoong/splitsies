"use client";

import { Copy, Share2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useBillStore } from "@/store/bill-store";
import { CalculationService } from "@/lib/services/calculation";
import { formatCurrency } from "@/lib/utils/currency";
import type { PersonSummary } from "@/types";

export function SummaryView() {
  const billItems = useBillStore((state) => state.billItems);
  const participants = useBillStore((state) => state.participants);
  const subtotal = useBillStore((state) => state.subtotal);
  const tax = useBillStore((state) => state.tax);
  const tip = useBillStore((state) => state.tip);
  const total = useBillStore((state) => state.total);
  const currency = useBillStore((state) => state.currency);
  const merchantName = useBillStore((state) => state.merchantName);
  const setCurrentStep = useBillStore((state) => state.setCurrentStep);
  const reset = useBillStore((state) => state.reset);

  // Calculate splits
  const summaries: PersonSummary[] = CalculationService.calculateSplits(
    billItems,
    participants,
    subtotal,
    tax,
    tip
  );

  const handleCopyToClipboard = async () => {
    const text = generateSummaryText();

    // Modern clipboard API (requires HTTPS on mobile)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
        return;
      } catch {
        // Fall through to legacy method
      }
    }

    // Legacy fallback for HTTP or unsupported browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success("Copied to clipboard!");
      } else {
        toast.error("Failed to copy");
      }
    } catch {
      toast.error("Failed to copy - please copy manually");
    }
  };

  const handleShare = async () => {
    const text = generateSummaryText();

    // Check if Web Share API is available (requires HTTPS on mobile)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Splitsies - ${merchantName || "Bill"} Split`,
          text,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        // User cancelled share - don't show error
        if ((err as Error).name === "AbortError") {
          return;
        }
        console.error("Error sharing:", err);
        // Fall through to clipboard copy
      }
    }

    // Fallback: copy to clipboard with helpful message
    await handleCopyToClipboard();
    toast.info("Share requires HTTPS. Text copied instead!", {
      duration: 3000,
    });
  };

  const generateSummaryText = (): string => {
    const lines: string[] = [];

    lines.push("✂️ Splitsies Bill Split");
    if (merchantName) {
      lines.push(`📍 ${merchantName}`);
    }
    lines.push(`💰 Total: ${formatCurrency(total, currency)}`);
    lines.push("");

    summaries.forEach((summary) => {
      lines.push(
        `${summary.participantName}: ${formatCurrency(
          summary.grandTotal,
          currency
        )}`
      );
      lines.push(`  Items: ${formatCurrency(summary.itemsTotal, currency)}`);
      if (summary.taxShare > 0) {
        lines.push(`  Tax: ${formatCurrency(summary.taxShare, currency)}`);
      }
      if (summary.tipShare > 0) {
        lines.push(`  Tip: ${formatCurrency(summary.tipShare, currency)}`);
      }
      lines.push("");
    });

    lines.push("Split with Splitsies 💙");
    return lines.join("\n");
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep("capture");
    toast.success("Ready for a new bill!");
  };

  const handleBack = () => {
    setCurrentStep("assignment");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Bill Split Complete!
            </h2>
            {merchantName && (
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                📍 {merchantName}
              </p>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Subtotal
            </p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {formatCurrency(subtotal, currency)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tax</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {formatCurrency(tax, currency)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tip</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {formatCurrency(tip, currency)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total
            </p>
            <p className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
              {formatCurrency(total, currency)}
            </p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyToClipboard}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Per-Person Breakdown */}
      <div className="space-y-4">
        {summaries.map((summary) => {
          const participant = participants.find(
            (p) => p.id === summary.participantId
          );
          return (
            <div
              key={summary.participantId}
              className="glass rounded-2xl p-4 sm:p-6"
            >
              {/* Participant Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: participant?.color }}
                >
                  {summary.participantName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {summary.participantName}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(summary.grandTotal, currency)}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Items ({summary.items.length})</span>
                  <span className="font-medium">
                    {formatCurrency(summary.itemsTotal, currency)}
                  </span>
                </div>
                {summary.taxShare > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax Share</span>
                    <span className="font-medium">
                      {formatCurrency(summary.taxShare, currency)}
                    </span>
                  </div>
                )}
                {summary.tipShare > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tip Share</span>
                    <span className="font-medium">
                      {formatCurrency(summary.tipShare, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  ITEMS:
                </p>
                <ul className="space-y-1 text-sm">
                  {summary.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-gray-700 dark:text-gray-300"
                    >
                      <span>
                        {item.name}
                        {item.quantity > 1 && ` ×${item.quantity}`}
                        {item.splitType === "shared" && " (shared)"}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button onClick={handleBack} className="btn-secondary flex-1">
          Back
        </button>
        <button onClick={handleStartOver} className="btn-primary flex-1">
          Start New Bill
        </button>
      </div>
    </div>
  );
}
