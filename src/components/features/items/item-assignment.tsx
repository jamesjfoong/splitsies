"use client";

import { useState } from "react";
import { Check, DollarSign } from "lucide-react";
import { useBillStore } from "@/store/bill-store";
import { formatCurrency } from "@/lib/utils/currency";
import { SplitType } from "@/types";
import { toast } from "sonner";

export function ItemAssignment() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const billItems = useBillStore((state) => state.billItems);
  const participants = useBillStore((state) => state.participants);
  const currency = useBillStore((state) => state.currency);
  const updateBillItem = useBillStore((state) => state.updateBillItem);
  const setCurrentStep = useBillStore((state) => state.setCurrentStep);

  const toggleParticipantForItem = (itemId: string, participantId: string) => {
    const item = billItems.find((i) => i.id === itemId);
    if (!item) return;

    const isAssigned = item.assignedTo.includes(participantId);
    const newAssignedTo = isAssigned
      ? item.assignedTo.filter((id) => id !== participantId)
      : [...item.assignedTo, participantId];

    // Determine split type based on number of assignments
    const splitType =
      newAssignedTo.length > 1 ? SplitType.Shared : SplitType.Individual;

    updateBillItem(itemId, {
      assignedTo: newAssignedTo,
      splitType,
    });
  };

  const allItemsAssigned = billItems.every(
    (item) => item.assignedTo.length > 0
  );
  const assignedCount = billItems.filter(
    (item) => item.assignedTo.length > 0
  ).length;

  const handleNext = () => {
    if (!allItemsAssigned) {
      toast.error("Please assign all items to at least one person");
      return;
    }
    setCurrentStep("summary");
  };

  const handleBack = () => {
    setCurrentStep("participants");
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Assign Items
        </h2>
      </div>

      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
        Click on each item and select who ordered it. Items can be shared among
        multiple people.
      </p>

      {/* Progress Indicator */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
            Assignment Progress
          </span>
          <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
            {assignedCount} / {billItems.length} items
          </span>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(assignedCount / billItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {billItems.map((item) => (
          <div
            key={item.id}
            className={`border-2 rounded-lg transition-all ${
              selectedItem === item.id
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : item.assignedTo.length > 0
                ? "border-green-300 dark:border-green-700 bg-white dark:bg-gray-800"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            {/* Item Header */}
            <button
              onClick={() =>
                setSelectedItem(selectedItem === item.id ? null : item.id)
              }
              className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-full flex items-center justify-center ${
                    item.assignedTo.length > 0
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {item.assignedTo.length > 0 && (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-2">
                        (×{item.quantity})
                      </span>
                    )}
                  </div>
                  {item.assignedTo.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {item.assignedTo.map((participantId) => {
                        const participant = participants.find(
                          (p) => p.id === participantId
                        );
                        return participant ? (
                          <span
                            key={participantId}
                            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: participant.color }}
                          >
                            {participant.name}
                          </span>
                        ) : null;
                      })}
                      {item.assignedTo.length > 1 && (
                        <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                          (Shared)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                  {formatCurrency(item.price, currency)}
                </div>
              </div>
            </button>

            {/* Participant Selection (Expanded) */}
            {selectedItem === item.id && (
              <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Select who should pay for this item:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {participants.map((participant) => {
                    const isAssigned = item.assignedTo.includes(participant.id);
                    return (
                      <button
                        key={participant.id}
                        onClick={() =>
                          toggleParticipantForItem(item.id, participant.id)
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isAssigned
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: participant.color }}
                          >
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {participant.name}
                          </span>
                          {isAssigned && (
                            <Check className="w-4 h-4 text-primary-600 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button onClick={handleBack} className="btn-secondary flex-1">
          Back to Participants
        </button>
        <button
          onClick={handleNext}
          disabled={!allItemsAssigned}
          className="btn-primary flex-1"
        >
          {allItemsAssigned
            ? "Continue to Summary"
            : `Assign All Items (${
                billItems.length - assignedCount
              } remaining)`}
        </button>
      </div>

      {!allItemsAssigned && (
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-3 text-center">
          💡 All items must be assigned to at least one person
        </p>
      )}
    </div>
  );
}
