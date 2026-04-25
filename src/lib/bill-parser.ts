export interface LineItem {
    id: string | number;
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
    category: string;
    issues: string[];
}

export interface BillData {
    hospitalName: string;
    patientName: string;
    age?: string | number;
    gender?: string;
    date: string;
    items: LineItem[];
    reportedTotal: number;
    calculatedTotal: number;
    subtotal: number;
    tax: number;
    taxAmount: number;
    severity: "Low" | "Medium" | "High";
    billNumber?: string;
    savings?: number;
    isPartial?: boolean;
    isDemo?: boolean;
    predefinedIssues?: any[];
}

const HOSPITALS = ["City Care Speciality", "Apollo Health", "Fortis Hospital", "Max Healthcare", "AIIMS Delhi"];
const PATIENTS = ["John Doe", "Jane Smith", "Arjun Kumar", "Priya Sharma", "Rahul Singh"];

export function generateDynamicBill(randomSeed?: string): BillData {
    // Use randomSeed or current time to vary results
    const seed = randomSeed || Date.now().toString();
    const index = seed.length % HOSPITALS.length;

    const hospitalName = HOSPITALS[index];
    const patientName = PATIENTS[index];
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const billNumber = `BL-${Math.floor(Math.random() * 9000) + 1000}`;

    // Generate random items
    const items: LineItem[] = [
        { id: 1, name: "Consultation Fee", qty: 1, unitPrice: 800, total: 800, category: "Consultation", issues: [] },
        { id: 2, name: "Paracetamol 500mg", qty: 2, unitPrice: 40, total: 80, category: "Medicine", issues: [] },
        { id: 3, name: "Syringe 5ml", qty: 5, unitPrice: 20, total: 100, category: "Consumables", issues: [] },
        { id: 4, name: "Room Charges (Semi-Private)", qty: 1, unitPrice: 3500, total: 3500, category: "Room", issues: [] },
    ];

    // Randomly add anomalies
    const dice = Math.random();

    if (dice > 0.3) {
        // Duplicate item
        items.push({ id: 5, name: "Paracetamol 500mg", qty: 1, unitPrice: 40, total: 40, category: "Medicine", issues: ["DUPLICATE"] });
    }

    if (dice > 0.5) {
        // High quantity
        items.push({ id: 6, name: "Sterile Gloves", qty: 45, unitPrice: 60, total: 2700, category: "Consumables", issues: ["EXCESS_QTY"] });
    }

    if (dice > 0.7) {
        // Vague charge
        items.push({ id: 7, name: "Miscellaneous Service Fee", qty: 1, unitPrice: 1250, total: 1250, category: "Other", issues: ["VAGUE_CHARGE"] });
    }

    const calculatedTotal = items.reduce((sum, item) => sum + item.total, 0);
    let reportedTotal = calculatedTotal;

    if (dice > 0.85) {
        // Total mismatch
        reportedTotal += 1500;
    }

    const issueCount = items.filter(item => item.issues.length > 0).length + (reportedTotal !== calculatedTotal ? 1 : 0);

    return {
        hospitalName,
        patientName,
        date,
        billNumber,
        items,
        reportedTotal,
        calculatedTotal,
        subtotal: calculatedTotal,
        tax: calculatedTotal * 0.18,
        taxAmount: calculatedTotal * 0.18, // Duplicated for legacy compatibility
        severity: issueCount > 3 ? "High" : issueCount > 1 ? "Medium" : "Low"
    };
}

const PRICE_CEILINGS: Record<string, number> = {
    "paracetamol": 30,
    "amoxicillin": 25,
    "syringe": 20,
    "gloves": 25,
    "mask": 15,
    "consultation": 1000,
    "iv fluid": 150,
    "admission": 2000,
    "cbc": 500,
    "x-ray": 1200,
    "mri": 8000,
    "ct scan": 5000,
    "ecg": 600,
    "bandage": 50,
    "saline": 120,
    "icu": 8000
};

// Benchmarks curated from apollopharmacy.in, pharmeasy.in, netmeds.com, etc.
export const marketReference: Record<string, number> = {
    "Syringe 5ml": 20,
    "Paracetamol 650mg": 25,
    "Amoxicillin 500mg": 40,
    "Gloves (Pair)": 25,
    "N95 Mask": 45,
    "Consultation": 500
};

const QTY_LIMITS: Record<string, number> = {
    "gloves": 5,
    "syringe": 3,
    "mask": 5,
    "iv line": 2,
    "saline": 2
};

export function detectAnomalies(bill: BillData) {
    if (bill.isDemo && bill.predefinedIssues) {
        bill.savings = bill.predefinedIssues.reduce((sum, issue) => sum + (issue.amount || 0), 0);
        bill.severity = (bill.predefinedIssues.some(i => i.severity === "High")) ? "High" : "Medium";
        return bill.predefinedIssues;
    }

    const issues: any[] = [];
    let totalSavings = 0;

    // 0. Calculated Bill (Strict Items Sum)
    const calculatedSubtotal = bill.items.reduce((sum, item) => {
        if (!item.total || item.total === 0) {
            item.total = (item.qty || 1) * (item.unitPrice || 0);
        }
        return sum + item.total;
    }, 0);

    // 1. Hidden Charges (Total Mismatch)
    if (bill.reportedTotal && bill.reportedTotal > calculatedSubtotal + 10) {
        const diff = bill.reportedTotal - calculatedSubtotal;
        totalSavings += diff;
        issues.push({
            type: "TOTAL_MISMATCH",
            title: "Hidden Unaccounted Charge",
            desc: `The bill total is ₹${diff} higher than the sum of all individual items recorded.`,
            severity: "High",
            amount: diff
        });
    }

    // 2. Duplicate Medicine Detection (Fuzzy)
    const normalizedSeen = new Map<string, number>();
    bill.items.forEach((item, index) => {
        const norm = item.name.toLowerCase()
            .replace(/\d+mg/g, '')
            .replace(/mg/g, '')
            .replace(/[^a-z]/g, '')
            .trim();

        if (norm.length > 3) {
            if (normalizedSeen.has(norm)) {
                totalSavings += item.total;
                issues.push({
                    type: "DUPLICATE",
                    title: `Duplicate Charge: ${item.name}`,
                    desc: `This appears to be a double-billing for the same medication.`,
                    severity: "High",
                    amount: item.total
                });
                item.issues.push("DUPLICATE");
            } else {
                normalizedSeen.set(norm, index);
            }
        }
    });

    // 3. Average Market Price Detection
    bill.items.forEach(item => {
        const name = item.name.toLowerCase();
        for (const [key, maxPrice] of Object.entries(PRICE_CEILINGS)) {
            if (name.includes(key) && item.unitPrice > maxPrice) {
                const excess = (item.unitPrice - maxPrice) * item.qty;
                totalSavings += excess;
                issues.push({
                    type: "OVERPRICED",
                    title: `Higher than average market price: ${item.name}`,
                    desc: `Billed at ₹${item.unitPrice}, benchmark pharmacy average is ₹${maxPrice}. Excess: ₹${excess}.`,
                    severity: "High",
                    amount: excess
                });
                item.issues.push("OVERPRICED");
            }
        }
    });

    // 4. Vague Charges
    bill.items.forEach(item => {
        const name = item.name.toLowerCase();
        const vagueKeywords = ["misc", "other", "service charge", "admin fee", "sundry", "general"];
        if (vagueKeywords.some(kw => name.includes(kw))) {
            issues.push({
                type: "VAGUE_CHARGE",
                title: "Vague Service Fee",
                desc: `"${item.name}" is a non-itemized fee and should be challenged for breakdown.`,
                severity: "Medium"
            });
            item.issues.push("VAGUE_CHARGE");
        }
    });

    // 5. Excess Quantity
    bill.items.forEach(item => {
        const name = item.name.toLowerCase();
        for (const [key, limit] of Object.entries(QTY_LIMITS)) {
            if (name.includes(key) && item.qty > limit) {
                issues.push({
                    type: "EXCESS_QTY",
                    title: `Excessive Quantity: ${item.name}`,
                    desc: `${item.qty} units exceeds common usage limit of ${limit} per visit.`,
                    severity: "Medium"
                });
                item.issues.push("EXCESS_QTY");
            }
        }
    });

    // Metadata Sync
    bill.calculatedTotal = calculatedSubtotal;
    bill.savings = totalSavings;
    bill.severity = (issues.filter(i => i.severity === "High").length > 0) ? "High" : (issues.length > 0 ? "Medium" : "Low");

    return issues;
}

