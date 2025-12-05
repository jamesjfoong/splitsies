"use client";

import { useBillStore } from "@/store/bill-store";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, X } from "lucide-react";
import { SplitType } from "@/types";
import type { BillItem } from "@/types";
import { toast } from "sonner";

export function ReviewItems() {
  const billItems = useBillStore((state) => state.billItems);
  const currency = useBillStore((state) => state.currency);
  const merchantName = useBillStore((state) => state.merchantName);
  const updateBillItem = useBillStore((state) => state.updateBillItem);
  const deleteBillItem = useBillStore((state) => state.deleteBillItem);
  const addBillItem = useBillStore((state) => state.addBillItem);
  const setCurrentStep = useBillStore((state) => state.setCurrentStep);

  const handleUpdateBillItem = (id: string, updates: Partial<BillItem>) => {
    updateBillItem(id, { ...updates, manuallyEdited: true });
  };

  const handleAddBillItem = () => {
    const newItem: BillItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      price: 0,
      quantity: 1,
      splitType: SplitType.Individual,
      assignedTo: [],
      manuallyEdited: true,
    };
    addBillItem(newItem);
    toast.success("Item added");
  };

  const handleNext = () => {
    if (billItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setCurrentStep("participants");
  };

  const handleBack = () => {
    setCurrentStep("capture");
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
        Review & Edit Items
      </h2>
      {merchantName && (
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
          📍 {merchantName}
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
        Review the parsed items and make any corrections needed
      </p>

      {/* Items List */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {billItems.map((item) => (
          <div
            key={item.id}
            className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
          >
            <div className="flex gap-2 sm:gap-3 mb-2">
              {/* Item Name */}
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  handleUpdateBillItem(item.id, { name: e.target.value })
                }
                className="flex-1 px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Item name"
              />

              {/* Delete Button */}
              <button
                onClick={() => deleteBillItem(item.id)}
                className="p-1 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                aria-label="Delete item"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </button>
            </div>

            <div className="flex gap-2 sm:gap-3 items-center">
              {/* Price */}
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Price
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleUpdateBillItem(item.id, {
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Quantity */}
              <div className="w-20 sm:w-24">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Qty
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateBillItem(item.id, {
                      quantity: Number.parseInt(e.target.value, 10) || 1,
                    })
                  }
                  min="1"
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Total */}
              <div className="w-24 sm:w-32">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Total
                </label>
                <div className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded">
                  {formatCurrency(item.price * item.quantity, currency)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <button
        onClick={handleAddBillItem}
        className="w-full mb-4 sm:mb-6 py-2 sm:py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base font-medium">Add Item</span>
      </button>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={handleBack} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={billItems.length === 0}
          className="btn-primary flex-1"
        >
          Next: Add People
        </button>
      </div>
    </div>
  );
}
