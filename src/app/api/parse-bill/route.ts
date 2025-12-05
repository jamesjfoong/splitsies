import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ParseResult, BillItem } from "@/types";
import { SplitType } from "@/types";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert File to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: file.type,
      },
    };

    const prompt = `You are a receipt/bill parsing expert. Analyze this receipt image and extract the following information in JSON format:

{
  "merchantName": "Name of the merchant/restaurant",
  "items": [
    {
      "name": "Item name",
      "price": 0.00,
      "quantity": 1
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "tip": 0.00,
  "total": 0.00,
  "currency": "USD",
  "confidence": 0.95
}

Rules:
- Extract ALL individual items with their names and prices
- If quantity is not specified, assume 1
- Calculate subtotal as sum of all items
- Identify tax and tip amounts if present
- Total should match the bottom line total on the receipt
- Set confidence (0-1) based on image quality and clarity
- IMPORTANT: Detect the currency code correctly:
  - "Rp" or "IDR" = Indonesian Rupiah (use "IDR")
  - "$" or "USD" = US Dollar (use "USD")
  - "€" or "EUR" = Euro (use "EUR")
  - "£" or "GBP" = British Pound (use "GBP")
  - "¥" or "JPY" or "CNY" = Yen/Yuan (use "JPY" or "CNY")
  - etc.
- Return ONLY valid JSON, no additional text
- If you cannot parse the receipt, return confidence: 0`;

    // Call Gemini API
    console.log("Calling Gemini 2.0 Flash API...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log("Gemini response received");

    // Extract JSON from response (sometimes wrapped in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from response:", text);
      return NextResponse.json(
        {
          error:
            "Failed to parse receipt. Please try again with a clearer image.",
        },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    //Transform to our format with proper types
    const billItems: BillItem[] = parsed.items.map(
      (item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name || "Unknown Item",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        assignedTo: [],
        splitType: SplitType.Individual,
        confidence: parsed.confidence || 0.8,
        manuallyEdited: false,
      })
    );

    const parseResult: ParseResult = {
      merchantName: parsed.merchantName || "",
      items: billItems,
      subtotal: Number(parsed.subtotal) || 0,
      tax: Number(parsed.tax) || 0,
      tip: Number(parsed.tip) || 0,
      total: Number(parsed.total) || 0,
      currency: parsed.currency || "USD",
      confidence: Number(parsed.confidence) || 0.8,
    };

    return NextResponse.json(parseResult);
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse bill",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
