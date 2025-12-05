import { z } from "zod/v4";

/**
 * Zod schema for validating and sanitizing Gemini API response
 * Provides type-safe parsing with automatic coercion and sanitization
 */

// Item schema with coercion and limits
const ItemSchema = z.object({
  name: z
    .string()
    .default("Unknown Item")
    .transform((s) => s.slice(0, 200).replace(/[<>]/g, "")), // Sanitize XSS
  price: z.coerce.number().nonnegative().default(0),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
});

// Currency must be valid ISO 4217 (3 uppercase letters)
const CurrencySchema = z
  .string()
  .toUpperCase()
  .pipe(
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .catch("USD")
  );

// Confidence clamped between 0-1
const ConfidenceSchema = z.coerce.number().min(0).max(1).catch(0.8);

// Main receipt schema
export const ReceiptResponseSchema = z.object({
  merchantName: z
    .string()
    .default("")
    .transform((s) => s.slice(0, 200).replace(/[<>]/g, "")),
  items: z.array(ItemSchema).max(100).default([]),
  subtotal: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  tip: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative().default(0),
  currency: CurrencySchema.default("USD"),
  confidence: ConfidenceSchema.default(0.8),
});

// Type inference from schema
export type ReceiptResponse = z.infer<typeof ReceiptResponseSchema>;

/**
 * Safely parse and validate Gemini response
 * Returns null if parsing fails completely
 */
export function parseReceiptResponse(data: unknown): ReceiptResponse | null {
  try {
    return ReceiptResponseSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Safe parse that returns a default empty receipt on failure
 */
export function parseReceiptResponseSafe(data: unknown): ReceiptResponse {
  const result = ReceiptResponseSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  // Return empty/invalid receipt
  return {
    merchantName: "",
    items: [],
    subtotal: 0,
    tax: 0,
    tip: 0,
    total: 0,
    currency: "USD",
    confidence: 0,
  };
}
