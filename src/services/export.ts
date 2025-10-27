import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FinancialPlan {
  id: string;
  lifestyleLevel: string;
  duration: number;
  persons: number;
  totalCostIDR: number;
  totalCostEUR: number;
  exchangeRate: number;
  categories: Array<{
    category: string;
    subcategory: string;
    description: string;
    monthlyIDR: number;
    monthlyEUR: number;
    yearlyIDR: number;
    yearlyEUR: number;
  }>;
  breakdown: {
    housing: { idr: number; eur: number; percentage: number };
    food: { idr: number; eur: number; percentage: number };
    transportation: { idr: number; eur: number; percentage: number };
    utilities: { idr: number; eur: number; percentage: number };
    healthcare: { idr: number; eur: number; percentage: number };
    entertainment: { idr: number; eur: number; percentage: number };
    visa: { idr: number; eur: number; percentage: number };
    other: { idr: number; eur: number; percentage: number };
  };
}

export class ExportService {
  async exportToExcel(plan: FinancialPlan): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Bali Finance Planner - Zusammenfassung'],
      [''],
      ['Parameter', 'Wert'],
      ['Lifestyle Level', plan.lifestyleLevel],
      ['Aufenthaltsdauer (Tage)', plan.duration],
      ['Anzahl Personen', plan.persons],
      ['Wechselkurs (EUR/IDR)', plan.exchangeRate],
      [''],
      ['Gesamtkosten (EUR)', plan.totalCostEUR],
      ['Gesamtkosten (IDR)', plan.totalCostIDR],
      ['Monatlich (EUR)', plan.totalCostEUR / (plan.duration / 30)],
      ['Monatlich (IDR)', plan.totalCostIDR / (plan.duration / 30)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Zusammenfassung');

    // Categories sheet
    const categoriesData = [
      ['Kategorie', 'Unterkategorie', 'Beschreibung', 'Monatlich (EUR)', 'Monatlich (IDR)', 'Jährlich (EUR)', 'Jährlich (IDR)'],
      ...plan.categories.map(cat => [
        cat.category,
        cat.subcategory,
        cat.description,
        cat.monthlyEUR,
        cat.monthlyIDR,
        cat.yearlyEUR,
        cat.yearlyIDR,
      ]),
    ];

    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Kategorien');

    // Breakdown sheet
    const breakdownData = [
      ['Kategorie', 'Betrag (EUR)', 'Betrag (IDR)', 'Prozentsatz'],
      ...Object.entries(plan.breakdown).map(([key, value]) => [
        key,
        value.eur,
        value.idr,
        `${value.percentage.toFixed(1)}%`,
      ]),
    ];

    const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData);
    XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Verteilung');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(excelBuffer);
  }

  async exportToPDF(plan: FinancialPlan): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Add custom font for better Unicode support
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text('Bali Finance Planner', 20, 20);
    doc.setFontSize(12);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 30);
    
    // Summary
    doc.setFontSize(16);
    doc.text('Zusammenfassung', 20, 50);
    doc.setFontSize(10);
    
    const summaryData = [
      `Lifestyle Level: ${plan.lifestyleLevel}`,
      `Aufenthaltsdauer: ${plan.duration} Tage`,
      `Anzahl Personen: ${plan.persons}`,
      `Wechselkurs: 1 EUR = ${plan.exchangeRate} IDR`,
      `Gesamtkosten: €${plan.totalCostEUR.toFixed(2)} (${plan.totalCostIDR.toLocaleString()} IDR)`,
      `Monatlich: €${(plan.totalCostEUR / (plan.duration / 30)).toFixed(2)} (${(plan.totalCostIDR / (plan.duration / 30)).toLocaleString()} IDR)`,
    ];
    
    let yPosition = 60;
    summaryData.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });
    
    // Categories table
    doc.setFontSize(16);
    doc.text('Kategorien', 20, yPosition + 10);
    yPosition += 20;
    
    const tableData = plan.categories.map(cat => [
      cat.category,
      cat.subcategory,
      `€${cat.monthlyEUR.toFixed(2)}`,
      `${cat.monthlyIDR.toLocaleString()} IDR`,
    ]);
    
    (doc as any).autoTable({
      head: [['Kategorie', 'Unterkategorie', 'Monatlich (EUR)', 'Monatlich (IDR)']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Breakdown
    yPosition = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Kostenverteilung', 20, yPosition);
    yPosition += 10;
    
    const breakdownData = Object.entries(plan.breakdown).map(([key, value]) => [
      key,
      `€${value.eur.toFixed(2)}`,
      `${value.percentage.toFixed(1)}%`,
    ]);
    
    (doc as any).autoTable({
      head: [['Kategorie', 'Betrag (EUR)', 'Prozentsatz']],
      body: breakdownData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Seite ${i} von ${pageCount} - Bali Finance Planner 2025`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}

export const exportService = new ExportService();