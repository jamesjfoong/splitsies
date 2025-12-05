"use client";

import { useBillStore } from "@/store/bill-store";
import { stringToColor } from "@/lib/utils/color";
import { Plus, X, Users } from "lucide-react";
import { useState } from "react";
import type { Participant } from "@/types";
import { toast } from "sonner";

export function ParticipantManager() {
  const [nameInput, setNameInput] = useState("");

  const participants = useBillStore((state) => state.participants);
  const addParticipant = useBillStore((state) => state.addParticipant);
  const removeParticipant = useBillStore((state) => state.removeParticipant);
  const setCurrentStep = useBillStore((state) => state.setCurrentStep);

  const handleAddParticipant = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      toast.error("Please enter a name");
      return;
    }

    // Check for duplicate names
    if (
      participants.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      toast.error("Participant already exists");
      return;
    }

    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: trimmedName,
      color: stringToColor(trimmedName),
    };

    addParticipant(newParticipant);
    setNameInput("");
    toast.success(`Added ${trimmedName}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddParticipant();
    }
  };

  const handleNext = () => {
    if (participants.length < 2) {
      toast.error("Please add at least 2 participants");
      return;
    }
    setCurrentStep("assignment");
  };

  const handleBack = () => {
    setCurrentStep("review");
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Who's Splitting?
        </h2>
      </div>

      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
        Add everyone who will be splitting this bill
      </p>

      {/* Add Participant Input */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter name..."
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none text-sm sm:text-base"
        />
        <button
          onClick={handleAddParticipant}
          className="btn-primary flex items-center gap-2 px-4 sm:px-6"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Participants List */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm sm:text-base">
              No participants yet. Add someone to get started!
            </p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0"
                style={{ backgroundColor: participant.color }}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                {participant.name}
              </span>
              <button
                onClick={() => removeParticipant(participant.id)}
                className="p-1 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={handleBack} className="btn-secondary flex-1">
          Back to Review
        </button>
        <button
          onClick={handleNext}
          disabled={participants.length < 2}
          className="btn-primary flex-1"
        >
          {participants.length < 2
            ? `Add ${2 - participants.length} more`
            : "Next: Assign Items"}
        </button>
      </div>

      {participants.length < 2 && participants.length > 0 && (
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-3 text-center">
          💡 At least 2 people are needed to split a bill
        </p>
      )}
    </div>
  );
}
