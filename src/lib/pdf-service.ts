import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillData } from './bill-parser';

export function generateComplaintPDF(bill: BillData, letter: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("MediShield AI", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

    doc.setDrawColor(200);
    doc.line(14, 32, pageWidth - 14, 32);

    // Bill Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Audit Summary", 14, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Hospital: ${bill.hospitalName}`, 14, 52);
    doc.text(`Patient: ${bill.patientName}`, 14, 58);
    doc.text(`Date: ${bill.date}`, 14, 64);
    doc.text(`Bill No: ${bill.billNumber || 'N/A'}`, 14, 70);

    // Items Table
    autoTable(doc, {
        startY: 80,
        head: [['Item Name', 'Qty', 'Unit Price', 'Total', 'Status']],
        body: bill.items.map(item => [
            item.name,
            item.qty.toString(),
            `INR ${item.unitPrice}`,
            `INR ${item.total}`,
            item.issues.length > 0 ? 'FLAGGED' : 'CLEAN'
        ]),
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Complaint Letter
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("Professional Dispute Letter", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitLetter = doc.splitTextToSize(letter, pageWidth - 28);
    doc.text(splitLetter, 14, finalY + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is an AI-generated audit report. Please verify all legal points before submission.", 14, doc.internal.pageSize.getHeight() - 10);

    doc.save(`MediShield_Audit_${bill.billNumber || 'Report'}.pdf`);
}
