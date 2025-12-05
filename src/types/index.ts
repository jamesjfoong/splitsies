// Bill Item Types
export enum SplitType {
  Individual = "individual",
  Shared = "shared",
}

export enum BillStatus {
  Draft = "draft",
  Finalized = "finalized",
  Settled = "settled",
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[];
  splitType: SplitType;
  confidence?: number;
  manuallyEdited: boolean;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  totalOwed?: number;
  hasPaid?: boolean;
  paidTo?: string;
}

export interface PersonSummary {
  participantId: string;
  participantName: string;
  itemsTotal: number;
  taxShare: number;
  tipShare: number;
  grandTotal: number;
  items: BillItem[];
}

export interface BillSession {
  id: string;
  createdAt: Date;
  photoUrl?: string;
  merchantName?: string;
  items: BillItem[];
  participants: Participant[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  status: BillStatus;
}

export interface ParseResult {
  merchantName?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  confidence: number;
}
