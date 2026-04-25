import { GoogleGenerativeAI } from "@google/generative-ai";
import { BillData, LineItem } from './bill-parser';
import { createWorker } from 'tesseract.js';

// Configuration for Gemini Vision
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function performOCR(imageFile: File): Promise<Partial<BillData>> {
    if (!API_KEY) {
        console.warn("GEMINI_API_KEY missing. Falling back to local Tesseract OCR.");
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imageFile);
        await worker.terminate();
        return parseBillTextFallback(text);
    }

    try {
        console.log("--- INITIALIZING GEMINI VISION PIPELINE ---");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert file to base64
        const imageData = await convertFileToGenerativePart(imageFile);

        const prompt = `
            Extract all information from this medical bill image and return it as a VALID JSON object.
            
            Schema Requirements:
            {
                "hospital_name": "string",
                "patient_name": "string",
                "age": "number or string",
                "gender": "string (Male/Female)",
                "bill_number": "string",
                "date": "string",
                "items": [
                    {
                        "name": "string",
                        "qty": number,
                        "unit_price": number,
                        "amount": number (qty * unit_price),
                        "category": "medicine/test/room/fee/other"
                    }
                ],
                "subtotal": number (sum of all items),
                "tax": number,
                "reported_total": number (the final total printed on the bill)
            }

            Critical Instructions:
            1. If "amount" is missing for an item, calculate it as qty * unit_price.
            2. Do NOT merge nearby unrelated numbers.
            3. Respect columns exactly (Item Name, Qty, Rate, Amount).
            4. If the bill has double charges for same items, list them as separate rows.
            5. Return ONLY the raw JSON object, no markdown or extra text.
        `;

        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const text = response.text();

        // Clean markdown backticks if any
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        // Map to internal BillData structure
        const details: Partial<BillData> = {
            hospitalName: parsed.hospital_name,
            patientName: parsed.patient_name,
            age: parsed.age,
            gender: parsed.gender,
            billNumber: parsed.bill_number,
            date: parsed.date,
            items: parsed.items.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.name,
                qty: parseFloat(item.qty) || 1,
                unitPrice: parseFloat(item.unit_price) || 0,
                total: parseFloat(item.amount) || ((parseFloat(item.qty) || 1) * (parseFloat(item.unit_price) || 0)), // Safety
                category: item.category || "Medical",
                issues: []
            })),
            subtotal: parsed.subtotal,
            tax: parsed.tax,
            reportedTotal: parsed.reported_total,
            isPartial: false
        };

        // Math Safety Check
        details.items?.forEach(i => {
            if (!i.total || i.total === 0) i.total = i.qty * i.unitPrice;
        });

        console.log("Gemini Extraction Successful:", details);
        return details;

    } catch (error) {
        console.error("Gemini Vision failed:", error);
        // Secondary safety fallback to Tesseract
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imageFile);
        await worker.terminate();
        return parseBillTextFallback(text);
    }
}

async function convertFileToGenerativePart(file: File) {
    const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64Data.split(",")[1],
            mimeType: file.type,
        },
    };
}

function parseBillTextFallback(text: string): Partial<BillData> {
    const lines = text.split('\n');
    const details: Partial<BillData> = {
        items: [],
        isPartial: true
    };

    console.log("--- FALLBACK RESILIENT OCR START ---");

    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.length < 3) return;

        // 1. HOSPITAL NAME
        if (index < 10 && !details.hospitalName) {
            const hospitalKeywords = ['hospital', 'clinic', 'care', 'medical', 'center', 'health', 'diagnostic'];
            if (hospitalKeywords.some(kw => cleanLine.toLowerCase().includes(kw))) {
                details.hospitalName = cleanLine;
            }
        }

        // 2. PATIENT NAME
        const patientMatch = cleanLine.match(/(?:Patient Name|Patient|Name|Mr\.|Ms\.|Mrs\.)\s*[:.-]?\s*([A-Za-z\s.]+)/i);
        if (patientMatch && !details.patientName) {
            details.patientName = patientMatch[1].trim();
        }

        // 3. LINE ITEMS (Robust Regex)
        let itemMatch = cleanLine.match(/^(.+?)(?:\s+|\|)(\d+)(?:\s+|\|)[₹|\s]?\s?([\d,.]+)(?:\s+|\|)[₹|\s]?\s?([\d,.]+)$/);
        if (!itemMatch) itemMatch = cleanLine.match(/^([A-Za-z\s]+)\s+(\d+)\s+([\d,.]+)$/);

        if (itemMatch) {
            const name = itemMatch[1].trim();
            const qty = parseInt(itemMatch[2]);
            const rate = itemMatch[3] ? parseFloat(itemMatch[3].replace(/[₹,]/g, '').trim()) : 0;
            const amt = itemMatch[4] ? parseFloat(itemMatch[4].replace(/[₹,]/g, '').trim()) : rate;

            if (!isNaN(amt) && amt > 0) {
                details.items?.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name, qty: qty || 1, unitPrice: amt / (qty || 1), total: amt,
                    category: "Medical", issues: []
                });
            }
        }
    });

    // Final inference for fallbacks
    if (!details.hospitalName) details.hospitalName = "Extracted Facility";
    if (!details.patientName) details.patientName = "Patient Account #402";

    const reversed = [...lines].reverse();
    for (const line of reversed) {
        const totalM = line.match(/(?:Total|Amount|Payable|Grand)\s*[:.-]?\s*[₹|\s]?\s?([\d,.]+)/i);
        if (totalM) {
            details.reportedTotal = parseFloat(totalM[1].replace(/[₹,]/g, '').trim());
            break;
        }
    }

    if (!details.reportedTotal && details.items && details.items.length > 0) {
        details.reportedTotal = details.items.reduce((s, i) => s + i.total, 0);
    }

    return details;
}
