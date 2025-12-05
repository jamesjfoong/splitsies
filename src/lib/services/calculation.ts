import type { BillItem, Participant, PersonSummary } from "@/types";
import { SplitType } from "@/types";

/**
 * Service for calculating bill splits and individual amounts
 */
export class CalculationService {
  /**
   * Calculate how much each person owes based on item assignments
   */
  static calculateSplits(
    items: BillItem[],
    participants: Participant[],
    subtotal: number,
    tax: number,
    tip: number
  ): PersonSummary[] {
    const summaries: PersonSummary[] = [];

    // Calculate actual subtotal from items (in case items were edited)
    const actualSubtotal = this.calculateSubtotalFromItems(items);
    // Use actual subtotal for proportional calculation, fall back to stored if no items
    const effectiveSubtotal = actualSubtotal > 0 ? actualSubtotal : subtotal;

    for (const participant of participants) {
      // Get items assigned to this person
      const assignedItems = items.filter((item) =>
        item.assignedTo.includes(participant.id)
      );

      // Calculate items total for this participant
      let itemsTotal = 0;
      for (const item of assignedItems) {
        const itemPrice = item.price * item.quantity;

        if (item.splitType === SplitType.Shared) {
          // Split equally among assigned people
          const shareCount = item.assignedTo.length;
          itemsTotal += itemPrice / shareCount;
        } else {
          // Individual item - full price
          itemsTotal += itemPrice;
        }
      }

      // Calculate this person's share based on their proportion of the actual subtotal
      const personalShare =
        effectiveSubtotal > 0 ? itemsTotal / effectiveSubtotal : 0;

      // Proportionally distribute tax and tip
      const taxShare = tax * personalShare;
      const tipShare = tip * personalShare;

      summaries.push({
        participantId: participant.id,
        participantName: participant.name,
        itemsTotal,
        taxShare,
        tipShare,
        grandTotal: itemsTotal + taxShare + tipShare,
        items: assignedItems,
      });
    }

    return summaries;
  }

  /**
   * Calculate equal split among all participants
   */
  static calculateEqualSplit(total: number, participantCount: number): number {
    if (participantCount === 0) return 0;
    return total / participantCount;
  }

  /**
   * Validate that all items are assigned
   */
  static areAllItemsAssigned(items: BillItem[]): boolean {
    return items.every((item) => item.assignedTo.length > 0);
  }

  /**
   * Calculate subtotal from items if not provided
   */
  static calculateSubtotalFromItems(items: BillItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
