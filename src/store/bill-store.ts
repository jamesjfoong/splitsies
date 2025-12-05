import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { BillItem, Participant } from "@/types";
import { SplitType } from "@/types";

type CurrentStep =
  | "capture"
  | "review"
  | "participants"
  | "assignment"
  | "summary";

interface BillState {
  // State
  currentStep: CurrentStep;
  billItems: BillItem[];
  participants: Participant[];
  merchantName: string;
  currency: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;

  // Actions
  setCurrentStep: (step: CurrentStep) => void;
  setBillItems: (items: BillItem[]) => void;
  setBillData: (data: {
    items: BillItem[];
    merchantName?: string;
    currency: string;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
  }) => void;
  updateBillItem: (id: string, updates: Partial<BillItem>) => void;
  deleteBillItem: (id: string) => void;
  addBillItem: (item: BillItem) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "capture" as CurrentStep,
  billItems: [],
  participants: [],
  merchantName: "",
  currency: "USD",
  subtotal: 0,
  tax: 0,
  tip: 0,
  total: 0,
};

export const useBillStore = create<BillState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCurrentStep: (step) => set({ currentStep: step }),

        setBillItems: (items) => set({ billItems: items }),

        setBillData: (data) =>
          set({
            billItems: data.items,
            merchantName: data.merchantName || "",
            currency: data.currency,
            subtotal: data.subtotal,
            tax: data.tax,
            tip: data.tip,
            total: data.total,
          }),

        updateBillItem: (id, updates) =>
          set((state) => ({
            billItems: state.billItems.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          })),

        deleteBillItem: (id) =>
          set((state) => ({
            billItems: state.billItems.filter((item) => item.id !== id),
          })),

        addBillItem: (item) =>
          set((state) => ({
            billItems: [...state.billItems, item],
          })),

        addParticipant: (participant) =>
          set((state) => ({
            participants: [...state.participants, participant],
          })),

        removeParticipant: (id) =>
          set((state) => {
            // Remove participant and clean up all item assignments
            const updatedBillItems = state.billItems.map((item) => ({
              ...item,
              assignedTo: item.assignedTo.filter(
                (participantId) => participantId !== id
              ),
              // Update splitType based on remaining assignments
              splitType:
                item.assignedTo.filter((participantId) => participantId !== id)
                  .length > 1
                  ? SplitType.Shared
                  : SplitType.Individual,
            }));

            return {
              participants: state.participants.filter((p) => p.id !== id),
              billItems: updatedBillItems,
            };
          }),

        updateParticipant: (id, updates) =>
          set((state) => ({
            participants: state.participants.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),

        reset: () => set(initialState),
      }),
      {
        name: "splitsies-storage",
      }
    ),
    { name: "BillStore" }
  )
);
